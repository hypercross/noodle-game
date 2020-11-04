import { AdhocEventTarget } from "./event";
import React from "react";

export class ActionContext extends AdhocEventTarget {
  selectables = [];
  selected = [];
  actions = [];

  updateAll = () => {
    const selected = this.selected;

    let ok = false;
    while (selected.length) {
      for (const action of this.actions) {
        const matched = action.matchSelected(selected);
        if (matched >= 0) {
          ok = true;
        }
        action.disabled = matched < 0;
        action.active = matched > 0;
      }
      if (!ok) {
        selected.shift().active = false;
      } else {
        break;
      }
    }

    this.actions.forEach(action => action.update());

    for (const one of this.selectables) {
      if (one.active && !one.disabled) {
        one.update();
        continue;
      }

      one.disabled = true;
      const predicted = [...selected, one];
      while (predicted.length) {
        for (const action of this.actions) {
          if (action.matchSelected(partial) < 0) continue;
          one.disabled = false;
          break;
        }
        if (!one.disabled) break;
        predicted.shift();
      }
      one.update();
    }
  };

  useSelectable(createSelectable, deps) {
    const selectable = React.useMemo(createSelectable, deps);
    React.useEffect(() => {
      if (!selectable) return;
      this.selectables.push(selectable);

      const cb = () => {
        const i = this.selected.indexOf(selectable);
        if (i >= 0 && !selectable.active) {
          this.selected.splice(i, 1);
          this.updateAll();
        } else if (i < 0 && selectable.active) {
          this.selected.push(selectable);
          this.updateAll();
        }
      };
      selectable.addEventListener("activeChanged", cb);
      return () => {
        const i = this.selectables.indexOf(selectable);
        if (i >= 0) this.selectables.splice(i, 1);
        selectable.removeEventListener("activeChanged", cb);
      };
    }, [selectable]);
    return selectable;
  }

  useAction(createAction, deps) {
    const action = React.useMemo(createAction, deps);
    React.useEffect(() => {
      if (!action) return;
      this.actions.push(action);
      return () => {
        const i = this.actions.indexOf(action);
        if (i >= 0) this.actions.splice(i, 1);
      };
    }, [action]);
    return action;
  }
}
const ctx = React.createContext(new ActionContext());
export function useActionContext() {
  return React.useContext(ctx);
}
export function ActionContextProvider() {
  const value = React.useMemo(() => new ActionContext(), []);
  return <ctx.Provider value={value} />;
}

const activeChanged = new Event("activeChanged");
export class Selectable extends AdhocEventTarget {
  /**
   * is this interactive?
   */
  disabled = false;
  /**
   * is this intended?
   */
  active = false;

  setActive(active) {
    if (this.active == active) return;
    this.active = active;
    this.dispatchEvent(activeChanged);
  }
}

export class SelectableAction extends Selectable {
  /**
   * 1 - complete sequence
   * 0 - partial sequence
   * -1 - not unmatched
   */
  matchSelected(selected) {
    return -1;
  }
}

export function testActionContext() {
  function namedSelectable(name) {
    return () => {
      const s = new Selectable();
      s.name = name;
      return s;
    };
  }
  function stringAction(sequence) {
    return () => {
      const a = new SelectableAction();
      a.sequence = sequence;
      a.matchSelected = selectable => {
        const partial = selectable.map(s => s.name).join("");
        console.log(partial, "vs", sequence);
        return sequence == partial ? 1 : sequence.startsWith(partial) ? 0 : -1;
      };
      return a;
    };
  }

  function Btn(props) {
    props.selectable.useUpdate();
    return (
      <button
        disabled={props.selectable.disabled}
        onClick={() => {
          props.selectable.setActive(!props.selectable.active);
        }}
      >
        {props.selectable.name || props.selectable.sequence || ""}
        {props.selectable.active ? "😊" : "😒"}
      </button>
    );
  }

  const ctx = useActionContext();
  const a1 = ctx.useSelectable(namedSelectable("a"), []);
  const a2 = ctx.useSelectable(namedSelectable("a"), []);
  const b1 = ctx.useSelectable(namedSelectable("b"), []);
  const b2 = ctx.useSelectable(namedSelectable("b"), []);
  const c1 = ctx.useSelectable(namedSelectable("c"), []);
  const c2 = ctx.useSelectable(namedSelectable("c"), []);
  const s1 = ctx.useAction(stringAction("ab"), []);
  const s2 = ctx.useAction(stringAction("bc"), []);
  React.useEffect(function() {
    ctx.updateAll();
  }, []);

  return (
    <div>
      {ctx.selectables
        .filter(s => s.active && !s.disabled)
        .map(s => s.name)
        .join("")}
      <Btn selectable={a1} />
      <Btn selectable={a2} />
      <Btn selectable={b1} />
      <Btn selectable={b2} />
      <Btn selectable={c1} />
      <Btn selectable={c2} />
      <Btn selectable={s1} />
      <Btn selectable={s2} />
    </div>
  );
}
