import { useEffect, useState, useMemo } from "react";
import { hash } from "./rng";
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
  id = hash(16);
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

  constructor(...params){
    super();
    this.set(...params);
  }

  fromParams(){}
  set(...params){
    this.params = params;
    this.fromParams();
  }

  copy(other){
    this.params = other.params.slice();
    this.fromParams();
  }

  clone(){
    return new this.constructor(...this.params);
  }
}
