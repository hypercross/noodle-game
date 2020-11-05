import { AdhocEventTarget } from "./event";

const onActiveChange = new Event('activeChanged');
export function setActive(target, active) {
  if (target.active == active) return;
  target.active = active;
  target.dispatchEvent(onActiveChange);
}

const onDisabledChange = new Event('disabledChanged');
export function setDisabled(target, disabled) {
  if (target.disabled == disabled) return;
  target.disabled = disabled;
  target.dispatchEvent(onDisabledChange);
}

export class Action extends AdhocEventTarget {
  fromParams() {
    const [name, match, run] = this.params;
    this.name = name;
    this.match = match;
    this.run = run;
  }

  updateFromSelected(selected) {
    const score = this.match(selected);
    this.active = score > 0;
    this.disabled = score < 0;
    this.update();
    return score;
  }
}

function trimSelected(selected, actions) {
  let ok = false;
  while (selected.length) {
    for (const action of actions) {
      if (ok) break;

      const matched = action.match(selected);
      if (matched >= 0)
        ok = true;
    }
    if (!ok) {
      selected.shift().active = false;
    } else {
      break;
    }
  }
}

function updateCandidate(selected, candidate, actions) {
  if (candidate.active && !candidate.disabled) {
    candidate.update();
    return;
  }

  candidate.disabled = true;
  const predicted = [...selected, candidate];
  while (predicted.length) {
    for (const action of actions) {
      if (action.match(predicted) < 0) continue;
      candidate.disabled = false;
      break;
    }
    if (!candidate.disabled) break;
    predicted.shift();
  }
  candidate.update();
}

export class ActionContext extends AdhocEventTarget {
  selectables = [];
  selected = [];
  actions = [];

  updateAll = () => {
    const selected = this.selected;

    trimSelected(selected, this.actions);

    this.actions.forEach(action => action.updateFromSelected(selected));

    for (const one of this.selectables) {
      updateCandidate(selected, one, this.actions);
    }

    this.update();
  };

  clearSelection(){
    for(const one of this.selectables){
      one.active = false;
    }
    this.selected.length = 0;
    this.updateAll();
  }

  addSelectable(selectable) {
    this.selectables.push(selectable);
    const syncSelected = () => {
      const i = this.selected.indexOf(selectable);
      const active = !!selectable.active;
      if (i < 0 && active) {
        this.selected.push(selectable);
      } else if (i >= 0 && !active) {
        this.selected.splice(i, 1);
      }

      this.updateAll();
    }

    selectable['_onRemoveSelectable_' + this.id] = syncSelected;
    selectable.addEventListener('activeChanged', syncSelected);
  }

  removeSelectable(selectable) {
    const i = this.selectables.indexOf(selectable);
    if (i < 0) return;

    const cb = selectable['_onRemoveSelectable_' + this.id];
    if (cb) {
      selectable.removeEventListener('activeChanged', cb);
    }

    if (selectable.active) {
      setActive(selectable, false);
    }

    this.selectables.splice(i, 1);
  }
}
