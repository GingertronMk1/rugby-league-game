import * as THREE from "three";
import { moveTowards, updateSupport } from "./support";
import { updateDefence } from "./defence";
import { PlayerPosition, type Player } from "./players";

type PassKey = "h" | "l";
interface Flight {
  from: THREE.Vector3;
  to: THREE.Vector3;
  recipient: THREE.Group | null;
  started: number;
  duration: number;
  height: number;
}

/** Controls home possession, movement and passing. */
export function setupPassing(
  scene: THREE.Scene,
  players: THREE.Group[],
  defenders: THREE.Group[],
  ball: THREE.Mesh,
  render: () => void,
) {
  const carrier = players.at(4);
  if (!carrier) throw new Error("Home team needs a ball carrier");

  function ring(color: number) {
    const mesh = new THREE.Mesh(
      new THREE.RingGeometry(1.5, 1.8, 32),
      new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }),
    );
    mesh.rotation.x = -Math.PI / 2;
    scene.add(mesh);
    return mesh;
  }
  const indicator = ring(0xd4ed88);
  const targetIndicator = ring(0xf9b75e);
  targetIndicator.visible = false;
  const kickIndicator = ring(0x9bdcf4);
  const kickArea = new THREE.Mesh(
    new THREE.CircleGeometry(4, 32),
    new THREE.MeshBasicMaterial({
      color: 0x9bdcf4,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    }),
  );
  kickArea.rotation.x = -Math.PI / 2;
  scene.add(kickArea);
  kickIndicator.visible = false;
  kickArea.visible = false;
  const kickTarget = new THREE.Vector3();
  let ruck: {
    tackled: THREE.Group;
    dummyHalf: THREE.Group;
    started: number;
    target: THREE.Vector3;
    ready: boolean;
  } | null = null;
  let tackleCooldown = 0;
  let aimingKick = false;
  let hasBall = true;
  let current: THREE.Group = carrier;
  let flight: Flight | null = null;
  let bounce: { velocity: THREE.Vector3 } | null = null;
  let heldPass: { key: PassKey; started: number } | null = null;
  const heldMovement = new Set<string>();
  const longPressMs = 450;
  const speed = 18;
  let previous = performance.now();
  let animation: number;

  function placeBall() {
    ball.position.set(current.position.x + 2, 0.7, current.position.z);
    indicator.position.set(current.position.x, 0.16, current.position.z);
  }
  placeBall();

  function targetFor(key: PassKey, longPass: boolean) {
    const direction = key === "h" ? -1 : 1;
    const candidates = players
      .filter(
        (player) =>
          player !== ruck?.tackled &&
          player.position.x < current.position.x &&
          (player.position.z - current.position.z) * direction > 0,
      )
      .sort(
        (left, right) =>
          left.position.distanceToSquared(current.position) -
          right.position.distanceToSquared(current.position),
      );
    return candidates.at(longPass && candidates.length > 1 ? 1 : 0);
  }

  function startPass(recipient: THREE.Group, now: number) {
    flight = {
      from: ball.position.clone(),
      to: new THREE.Vector3(
        recipient.position.x + 2,
        0.7,
        recipient.position.z,
      ),
      recipient,
      started: now,
      duration: 450,
      height: 2,
    };
    indicator.visible = false;
    targetIndicator.visible = false;
  }

  function isTextInput(target: EventTarget | null) {
    return (
      target instanceof HTMLElement &&
      (target.isContentEditable ||
        /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
    );
  }

  function onKeyDown(event: KeyboardEvent) {
    if (
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      isTextInput(event.target)
    )
      return;
    const key = event.key.toLowerCase();
    if (ruck) {
      if (
        ruck.ready &&
        (key === "h" || key === "l") &&
        !event.repeat &&
        !heldPass
      ) {
        event.preventDefault();
        heldPass = { key, started: performance.now() };
      }
      return;
    }
    if (["w", "a", "s", "d"].includes(key)) {
      event.preventDefault();
      heldMovement.add(key);
    } else if (
      key === "k" &&
      !event.repeat &&
      !flight &&
      hasBall &&
      !heldPass &&
      !aimingKick
    ) {
      event.preventDefault();
      aimingKick = true;
      heldMovement.clear();
      kickTarget.set(
        Math.min(current.position.x + 30, 64),
        0.18,
        current.position.z,
      );
      kickIndicator.visible = true;
      kickArea.visible = true;
    } else if (
      (key === "h" || key === "l") &&
      !event.repeat &&
      !heldPass &&
      !aimingKick &&
      hasBall &&
      !flight
    ) {
      event.preventDefault();
      heldPass = { key, started: performance.now() };
    }
  }

  function onKeyUp(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    heldMovement.delete(key);
    if (ruck && !ruck.ready) return;
    if (key === "k" && aimingKick) {
      aimingKick = false;
      heldMovement.clear();
      kickIndicator.visible = false;
      kickArea.visible = false;
      indicator.visible = false;
      hasBall = false;
      flight = {
        from: ball.position.clone(),
        to: new THREE.Vector3(kickTarget.x, 0.7, kickTarget.z),
        recipient: null,
        started: performance.now(),
        duration: 1200,
        height: 12,
      };
      return;
    }
    if (heldPass?.key !== key) return;
    const now = performance.now();
    const recipient = targetFor(
      heldPass.key,
      now - heldPass.started >= longPressMs,
    );
    heldPass = null;
    targetIndicator.visible = false;
    if (recipient && !flight) {
      if (ruck) {
        ruck = null;
        tackleCooldown = now + 900;
      }
      startPass(recipient, now);
    }
  }

  function onBlur() {
    heldMovement.clear();
    heldPass = null;
    aimingKick = false;
    targetIndicator.visible = false;
    kickIndicator.visible = false;
    kickArea.visible = false;
  }

  function startRuck(now: number) {
    const hooker = players.find(
      (player) =>
        (player.userData.player as Player).position === PlayerPosition.Hooker &&
        player !== current,
    );
    const dummyHalf =
      hooker ??
      players
        .filter((player) => player !== current)
        .sort(
          (left, right) =>
            left.position.distanceToSquared(current.position) -
            right.position.distanceToSquared(current.position),
        )
        .at(0);
    if (!dummyHalf) return;
    ruck = {
      tackled: current,
      dummyHalf,
      started: now,
      ready: false,
      target: new THREE.Vector3(
        Math.max(-64, current.position.x - 3),
        0,
        current.position.z,
      ),
    };
    heldMovement.clear();
    heldPass = null;
    aimingKick = false;
    targetIndicator.visible = false;
    kickIndicator.visible = false;
    kickArea.visible = false;
    indicator.visible = false;
    ball.position.set(current.position.x - 1.5, 0.7, current.position.z);
  }

  function update(now: number) {
    const elapsed = Math.min((now - previous) / 1000, 0.05);
    previous = now;
    if (ruck) {
      const { tackled, dummyHalf, target, started } = ruck;
      const arrived = moveTowards(dummyHalf, target, 22, elapsed);
      updateSupport(players, tackled, elapsed, [dummyHalf], target.x);
      if (arrived && now - started >= 700 && !ruck.ready) {
        current = dummyHalf;
        placeBall();
        indicator.visible = true;
        ruck.ready = true;
      }
      const targetPlayer =
        ruck.ready &&
        heldPass &&
        targetFor(heldPass.key, now - heldPass.started >= longPressMs);
      targetIndicator.visible = Boolean(targetPlayer);
      if (targetPlayer)
        targetIndicator.position.set(
          targetPlayer.position.x,
          0.17,
          targetPlayer.position.z,
        );
    } else if (flight) {
      const progress = Math.min((now - flight.started) / flight.duration, 1);
      ball.position.lerpVectors(flight.from, flight.to, progress);
      ball.position.y += Math.sin(progress * Math.PI) * flight.height;
      if (progress === 1) {
        const recipient = flight.recipient;
        if (!recipient) {
          const direction = flight.to
            .clone()
            .sub(flight.from)
            .setY(0)
            .normalize();
          bounce = { velocity: direction.multiplyScalar(5).setY(6) };
        }
        flight = null;
        if (recipient) {
          current = recipient;
          hasBall = true;
          indicator.visible = true;
          placeBall();
        }
      }
    } else {
      if (bounce && !aimingKick) {
        bounce.velocity.y -= 20 * elapsed;
        ball.position.addScaledVector(bounce.velocity, elapsed);
        if (ball.position.y <= 0.7) {
          ball.position.y = 0.7;
          bounce.velocity.y = Math.abs(bounce.velocity.y) * 0.45;
          bounce.velocity.x *= 0.6;
          bounce.velocity.z *= 0.6;
          if (bounce.velocity.y < 1) bounce = null;
        }
        ball.position.x = THREE.MathUtils.clamp(ball.position.x, -64, 64);
        ball.position.z = THREE.MathUtils.clamp(ball.position.z, -33, 33);
      }
      const dx = Number(heldMovement.has("d")) - Number(heldMovement.has("a"));
      const dz = Number(heldMovement.has("s")) - Number(heldMovement.has("w"));
      const length = Math.hypot(dx, dz);
      if (length > 0 && aimingKick) {
        kickTarget.x = THREE.MathUtils.clamp(
          kickTarget.x + (dx / length) * speed * elapsed,
          Math.min(current.position.x + 3, 64),
          64,
        );
        kickTarget.z = THREE.MathUtils.clamp(
          kickTarget.z + (dz / length) * speed * elapsed,
          -33,
          33,
        );
        const offset = new THREE.Vector2(
          kickTarget.x - current.position.x,
          kickTarget.z - current.position.z,
        );
        if (offset.length() > 50) {
          offset.setLength(50);
          kickTarget.x = current.position.x + offset.x;
          kickTarget.z = current.position.z + offset.y;
        }
      } else if (length > 0) {
        current.position.x = THREE.MathUtils.clamp(
          current.position.x + (dx / length) * speed * elapsed,
          -64,
          64,
        );
        current.position.z = THREE.MathUtils.clamp(
          current.position.z + (dz / length) * speed * elapsed,
          -33,
          33,
        );
        if (hasBall) placeBall();
        else {
          indicator.position.set(current.position.x, 0.16, current.position.z);
          if (
            Math.hypot(
              current.position.x - ball.position.x,
              current.position.z - ball.position.z,
            ) < 2.5
          ) {
            hasBall = true;
            bounce = null;
            indicator.visible = true;
            placeBall();
          }
        }
      }
      if (hasBall && !aimingKick) {
        updateSupport(players, current, elapsed);
        updateDefence(defenders, current, elapsed, speed / 2);
        if (
          now >= tackleCooldown &&
          defenders.some(
            (defender) =>
              Math.hypot(
                defender.position.x - current.position.x,
                defender.position.z - current.position.z,
              ) < 2.1,
          )
        )
          startRuck(now);
      }
      if (aimingKick) {
        kickIndicator.position.copy(kickTarget);
        kickArea.position.set(kickTarget.x, 0.15, kickTarget.z);
      }
      const target =
        heldPass &&
        targetFor(heldPass.key, now - heldPass.started >= longPressMs);
      targetIndicator.visible = Boolean(target);
      if (target)
        targetIndicator.position.set(
          target.position.x,
          0.17,
          target.position.z,
        );
    }
    render();
    animation = requestAnimationFrame(update);
  }
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);
  animation = requestAnimationFrame(update);
  return {
    dispose() {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      cancelAnimationFrame(animation);
      for (const mesh of [
        indicator,
        targetIndicator,
        kickIndicator,
        kickArea,
      ]) {
        scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
      }
    },
  };
}
