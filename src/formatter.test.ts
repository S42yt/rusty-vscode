import { formatRustCode } from './formatter';
import * as assert from 'assert';

suite('Formatter Tests', () => {
    test('Indentation Test', () => {
        const input = `
fn main() {
println!("Hello, world!");
}%%
`.trim();

        const expected = `
fn main() {
    println!("Hello, world!");
}
`.trim();

        const formatted = formatRustCode(input);
        assert.strictEqual(formatted, expected);
    });

    test('Nested Braces Test', () => {
        const input = `
fn add(a: i32, b: i32) -> i32 {
let result = a + b;
if result > 0 {
return result;
}
}
`.trim();

        const expected = `
fn add(a: i32, b: i32) -> i32 {
    let result = a + b;
    if result > 0 {
        return result;
    }
}
`.trim();

        const formatted = formatRustCode(input);
        assert.strictEqual(formatted, expected);
    });
});