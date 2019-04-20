import StockyardReportParser from '../Parser';

describe('Stockyard Report Parser', () => {

  const Parser = new StockyardReportParser();

  it('should parse a weight', async () => {
      const weight = '100';

      let result = Parser.Weight.parse(weight);

      expect(result).toBe(100);
  });

  it('should parse a weight range', async () => {
    const range = '100-200';

    let result = Parser.WeightRange.parse(range);

    expect(result.Min).toBe(100);
    expect(result.Max).toBe(200);
  });

  it('should parse a weight range or weight', async () => {
    const range = '100-200';
    const weight = '100';

    let result = Parser.WeightColumn.parse(range);

    expect(result.Min).toBe(100);
    expect(result.Max).toBe(200);

    result = Parser.WeightColumn.parse(weight);

    expect(result.Min).toBe(100);
    expect(result.Max).toBe(100);
  });

  it('should parse a price', async () => {
      const price = '140.50';

      let result = Parser.AvgPrice.parse(price);

      expect(result).toBe(140.50);
  });

  it('should parse a price range', async () => {
    const range = '140.50-200.00';

    let result = Parser.PriceRange.parse(range);

    expect(result.Min).toBe(140.50);
    expect(result.Max).toBe(200.00);
  });

  it('should parse a price range or average price', async () => {
    const range = '140.50-200.00';
    const price = '140.50';

    let result = Parser.PriceColumn.parse(range);

    expect(result.Min).toBe(140.50);
    expect(result.Max).toBe(200.00);

    result = Parser.PriceColumn.parse(price);

    expect(result.Min).toBe(140.50);
  });

  it('should parse catagory row', async () => {
    const categoryLine = "1     1095      1095       115.00         115.00\n"

    let result = Parser.CategoryData.parse(categoryLine);

    expect(result.Head).toBe(1);

    expect(result.Weight.Min).toBe(1095);
    expect(result.Weight.Max).toBe(1095);
    expect(result.AverageWeight).toBe(1095);

    expect(result.Price.Min).toBe(115.00);
    expect(result.Price.Max).toBe(115.00);
    expect(result.AveragePrice).toBe(115.00);
  });

  it('should parse catagory row with alternate values', async () => {
    const categoryLine = "1     1095-2000      1095       115.00-200.50         115.00 Value Added\n"

    let result = Parser.CategoryData.parse(categoryLine);

    expect(result.Head).toBe(1);

    expect(result.Weight.Min).toBe(1095);
    expect(result.Weight.Max).toBe(2000);
    expect(result.AverageWeight).toBe(1095);

    expect(result.Price.Min).toBe(115.00);
    expect(result.Price.Max).toBe(200.50);
    expect(result.AveragePrice).toBe(115.00);

    expect(result.Notes).toBe('Value Added');
  });

  it('should parse category label', async () => {
    const label = "                    Feeder Steers Medium and Large 1-2\n";

    let result = Parser.CategoryLabel.parse(label);

    expect(result).toBe("Feeder Steers Medium and Large 1-2")
  })

  it('should parse an entire category block', async () => {
    const categoryBlock = 
    `                          Feeder Steers Large 1                           
    Head   Wt Range   Avg Wt    Price Range   Avg Price                
       7   415-447      439    145.00-171.00     159.98                
      14   505-526      515    132.50-166.50     150.07                
       9   550-595      567    142.00-160.50     151.03
       
    `

    let result = Parser.Category.parse(categoryBlock);

    expect(result.Label).toBe('Feeder Steers Large 1');
    expect(result.Data.length).toBe(3);
    expect(result.Data[0].Head).toBe(7);
  })
});
