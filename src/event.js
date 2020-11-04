import { useEffect, useState, useMemo } from "react";
const update = new Event("update");

/**
 * @param target: EventTarget
 */
export function useEvent(target, type, callback, deps) {
  useEffect(function() {
    if (!target) return;
    if (!type) return;

    target.addEventListener(type, callback);
    return function() {
      target.removeEventListener(type, callback);
    };
  }, deps);
}

export class AdhocEventTarget extends EventTarget {
  id = Math.random()
    .toString(16)
    .slice(-8);
  update() {
    this.dispatchEvent(update);
  }

  useUpdateEffect(cb) {
    useEvent(this, "update", cb, [this]);
  }

  useUpdate() {
    const [i, inc] = useState(0);
    const cb = useMemo(
      function() {
        let j = i;
        return () => inc(++j);
      },
      [inc]
    );

    this.useUpdateEffect(cb);
  }
}
