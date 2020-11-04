import {AdhocEventTarget} from "./event";

    class Blah extends AdhocEventTarget{
        fromParams(){
            const [foo, bar] = this.params;
            this.foo = foo;
            this.bar = bar;
        }
    }

test('object manipulation', () => {
    const you = new Blah('foo', 'bar');
    expect(you.foo).toEqual('foo');
    expect(you.bar).toEqual('bar');

    const you2 = you.clone();
    expect(you2.foo).toEqual('foo');
    expect(you2.bar).toEqual('bar');

    const you3 = new Blah('bar', 'foo');
    you3.copy(you);
    expect(you3.foo).toEqual('foo');
    expect(you3.bar).toEqual('bar');
});

test('dispatching', () => {

    const you = new Blah('foo', 'bar');
    let good = false;
    you.addEventListener('update', () => {
        good = true;
    });
    you.update();
    expect(good).toBe(true);
});
