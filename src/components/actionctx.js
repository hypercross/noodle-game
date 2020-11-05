import React, { useMemo } from "react";
import { ActionContext, setActive } from "../game";

const ctx = React.createContext(new ActionContext());
export function useActionContext() {
  return React.useContext(ctx);
}
export function ActionContextProvider() {
  const value = React.useMemo(() => new ActionContext(), []);
  const Provider = ctx.Provider;
  return <Provider value={value} />;
}

export function useSelectable(ctx, selectable) {
  React.useEffect(() => {
    if (!ctx) return;
    if (!selectable) return;

    ctx.addSelectable(selectable);
    return () => {
      ctx.removeSelectable(selectable);
    };
  }, [ctx, selectable]);
  return selectable;
}

export function useAction(ctx, action) {
  React.useEffect(() => {
    if (!action) return;
    ctx.actions.push(action);
    return () => {
      const i = ctx.actions.indexOf(action);
      if (i >= 0) ctx.actions.splice(i, 1);
    };
  }, [ctx, action]);
  return action;
}

export function withAction(Component) {
  return function(props) {
    const { selectable, ...others } = props;
    const ctx = useActionContext();
    useSelectable(ctx, selectable);
    selectable.useUpdate();

    const onToggleActive = useMemo(function(){
      return () => selectable.disabled || setActive(selectable, !selectable.active)
    }, [selectable]);

    const { active, disabled } = selectable;
    const renderProps = selectable.renderProps();
    return <Component active={active} disabled={disabled} onToggleActive={onToggleActive} {...others} {...renderProps} />
  }
}
