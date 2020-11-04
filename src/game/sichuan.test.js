import { prepareFlavors, prepareCustomers, prepareIngredients } from "./sichuan";

test('ingredients', () => {
    const ingredients = prepareIngredients();
    expect(ingredients.length).toBe(74);
});

test('flavors', () => {
    const { flavors, bargain } = prepareFlavors();
    expect(bargain.tiers.length).toBe(1);
    expect(flavors.length).toBe(16);
});

test('customers', () => {
    const customers = prepareCustomers();
    expect(customers[0].score).toBe(5);
    expect(customers.length).toBe(8);
});
