export default class Category {
    constructor(label, data) {
        this.Label = label;
        this.Data = data;
    }

    filter(minWeight, maxWeight) {
        let filteredData = this.Data.filter(d => d.Weight.Min == minWeight && d.Weight.Max == maxWeight)

        return new Category(this.Label, filteredData);
    }
}