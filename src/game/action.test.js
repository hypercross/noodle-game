import { ActionContext, Action, setActive, setDisabled } from "./action";
import { AdhocEventTarget } from "./event";

class Target extends AdhocEventTarget {
    fromParams() {
        const [quirk] = this.params;
        this.quirk = quirk;
    }
}

class SeqAction extends Action {
    fromParams() {
        const [sequence] = this.params;
        this.sequence = sequence;
        this.name = 'seq action ' + this.sequence;
    }
    match(selected) {
        const seq = selected.map(s => s.quirk).join('');
        return this.sequence == seq ? 1 : this.sequence.startsWith(seq) ? 0 : -1;
    }
    run() {
        console.log('run ', this.sequence);
    }
}

test("selecting", () => {
    const ctx = new ActionContext();

    const ab = new SeqAction('ab');
    const bc = new SeqAction('bc');
    ctx.actions.push(
        ab, bc
    );

    const a = new Target('a');
    const b = new Target('b');
    const c = new Target('c');

    ctx.addSelectable(a);
    ctx.addSelectable(b);
    ctx.addSelectable(c);

    function summaryTarget(obj){
        return `${obj.quirk || obj.sequence}${obj.active ? 'O' : obj.disabled ? 'X' : '-'}`;
    }

    function summary(){
        return [a,b,c,ab,bc].map(summaryTarget).join('');
    }

    ctx.updateAll();
    expect(summary()).toBe('a-b-cXab-bc-');

    setActive(a, true);
    expect(summary()).toBe('aOb-cXab-bcX');

    setActive(b, true);
    expect(summary()).toBe('aObOc-abObcX');

    setActive(c, true);
    expect(summary()).toBe('a-bOcOabXbcO');

    setActive(a, true);
    expect(summary()).toBe('aOb-cXab-bcX');
});
