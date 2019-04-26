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

  it('should parse note with dash', async () => {
    const categoryLine = "1     1095-2000      1095       115.00-200.50         115.00   4 - 6 Mos Bred\n"

    let result = Parser.CategoryData.parse(categoryLine);

    expect(result.Notes).toBe('4 - 6 Mos Bred');
  });

  it('should parse category label', async () => {
    const label = "                    Feeder Steers Medium and Large 1-2\n";

    let result = Parser.CategoryLabel.parse(label);

    expect(result).toBe("Feeder Steers Medium and Large 1-2")
  });

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
  });

  it('should parse first subcategory in a block', async () => {
    const categoryBlock = 
    `               Feeder Steers Large 1                           
    Head   Wt Range   Avg Wt    Price Range   Avg Price                
       7   415-447      439    145.00-171.00     159.98                
      14   505-526      515    132.50-166.50     150.07                
       9   550-595      567    142.00-160.50     151.03
       
    `

    let result = Parser.Subcategory.parse(categoryBlock);

    expect(result.Label).toBe('Feeder Steers Large 1');
    expect(result.Data.length).toBe(3);
    expect(result.Data[0].Head).toBe(7);
  });

  it('should parse other subcategories in a block', async () => {
    const categoryBlock = 
    `      Boner 80-85% Lean
      2    860-860    860     40.00-42.00       41.00
      7    910-1150  1011     39.00-45.50       43.75
       
    `

    let result = Parser.Subcategory.parse(categoryBlock);

    expect(result.Label).toBe('Boner 80-85% Lean');
    expect(result.Data.length).toBe(2);
    expect(result.Data[0].Head).toBe(2);
  });

  it('should filter category based on weight', async () => {
    const categoryBlock = 
    `Feeder Steers                Medium and Large 1 - 2                         
    Head   Wt Range   Avg Wt    Price Range   Avg Price                
       7   415-447      439    145.00-171.00     159.98                
      14   505-526      515    132.50-166.50     150.07                
       9   550-595      567    142.00-160.50     151.03
       
    `

    var result = Parser.Category.parse(categoryBlock).filter(505, 526);

    expect(result.Label).toBe('Feeder Steers                Medium and Large 1 - 2');
    expect(result.Data.length).toBe(1);
    expect(result.Data[0].Head).toBe(14);
  });

  it('should ignore category notes', async () => {
    const categoryBlock = 
    `                Medium and Large 1 - 2                         
    Head   Wt Range   Avg Wt    Price Range   Avg Price                
       7   415-447      439    145.00-171.00     159.98                
      14   505-526      515    132.50-166.50     150.07                
       9   550-595      567    142.00-160.50     151.03
    Groups of 20 head or more:
    64 head 590 lbs 148.00 blk

    `

    var result = Parser.Category.parse(categoryBlock);

    expect(result.Label).toBe('Medium and Large 1 - 2');
    expect(result.Data.length).toBe(3);
    expect(result.Data[0].Head).toBe(7);
  });

  it('should parse subcategories', async () => {
    const categoryBlock = 
    `Slaughter Cows                Breaker 70-80% Lean
Head   Wt Range   Avg Wt    Price Range   Avg Price
  16   1045-1385  1209     45.50-61.00       54.51
   1   1250-1250  1250        64.00          64.00   High Dressing
   5   1460-1480  1464     47.50-58.00       54.08
                              Boner 80-85% Lean
   2    860-860    860     40.00-42.00       41.00
   7    910-1150  1011     39.00-45.50       43.75
                               Lean 85-90% Lean
   2    765-785    775     32.00-35.00       33.48
   1    740-740    740        54.50          54.50   High Dressing
   3    830-1005   892     31.50-34.00       32.28
  13    830-1090   980     43.00-59.00       53.36   High Dressing
   2    925-1075  1000        20.00          20.00   Low Dressing
       
    `

    var result = Parser.CategoryWithSubsections.parse(categoryBlock);

    expect(result.Label).toBe('Slaughter Cows');
    expect(result.Data.length).toBe(3);
    expect(result.Data[0].Label).toBe('Breaker 70-80% Lean');
    expect(result.Data[1].Label).toBe('Boner 80-85% Lean');
    expect(result.Data[2].Label).toBe('Lean 85-90% Lean');
  });

  it('should parse a paragraph', async () => {
    const paragraph = `Lake Cumberland Livestock, Somerset, KY.

    Other.

    `

    var result = Parser.Paragraph.parse(paragraph);

    expect(result).toBe('Lake Cumberland Livestock, Somerset, KY.\nOther.');
  });

  it('should parse a report', async () => {
    const report = 
    `Feeder Steers                Medium and Large 1 - 2
 Head   Wt Range   Avg Wt    Price Range   Avg Price
    3    200-235    223    150.00-170.00     162.28
    3    296-296    296       176.00         176.00
   16    305-345    330    160.00-177.00     174.20
    8    335-335    335       187.00         187.00   
    1    345-345    345       177.50         177.50   
   17    365-387    380    161.00-178.00     173.83
    9    350-365    360    179.00-185.00     183.00   
   20    410-445    434    160.00-177.00     172.67
    2    435-435    435       180.00         180.00   
    2    435-435    435       173.00         173.00   
   26    450-495    479    153.00-171.00     166.08
    1    460-460    460       176.00         176.00   
   26    495-495    495       151.50         151.50   
   23    505-535    522    153.00-171.00     163.27
    3    555-595    575    149.00-165.00     155.18
   10    613-643    628    136.00-154.00     146.44
   10    660-690    678    136.00-147.00     142.53
    2    705-730    718    130.00-145.00     137.37
   19    739-739    739       137.50         137.50   
   11    780-790    781    126.00-128.00     127.82
   19    814-840    819    122.00-130.00     128.12
    8    870-870    870       126.50         126.50
    1    930-930    930       119.00         119.00
   54   1000-1000  1000       119.85         119.85   
   26   1055-1055  1055       114.00         114.00
  Groups of 20 head or more:
  64 head 590 lbs 148.00 blk
   
                   Feeder Heifers Medium and Large 2-3
     Head   Wt Range   Avg Wt    Price Range   Avg Price
        3    250-300     267    136.00-141.00     139.25
        8    300-350     336    133.00-140.00     138.34
        1    350-400     355       140.00         140.00
        3    400-450     423    135.00-140.00     136.65
        3    450-500     458       134.00         134.00
        1    500-550     540       131.00         131.00
        5    550-600     571    110.00-125.00     116.09
        2    600-650     635    118.00-120.00     119.00
        1    650-700     660       118.00         118.00
        3    700-750     717    100.00-106.00     103.99
     
Stock Bulls: Angus 16-24 mos. old 775.00-1475.00 per hd

Baby Calves: Beef: 170.00-310.00 Dairy: no test 

Cow/Calf Pairs: 2-10 yrs. Old W/70-350 calves by side 675.00-1500.00 per pair

***This report reflects the majority of cattle sold with a USDA grade, weight, 
and sex. This report does not reflect all animals sold on the above date.*** 


Source:  KY Dept of Ag-USDA Market News Service, Frankfort, KY
	   Mike Bell, Market Reporter, 502-782-4139
	   24 Hour Toll Free Market News Report 1-800-327-6568
	   http://www.ams.usda.gov/mnreports/SV_LS_146 txt
    `

    let result = Parser.Report.parse(report);

    expect(result.length).toBe(2);
  });
});
