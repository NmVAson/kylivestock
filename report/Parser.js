import { Parse } from 'sprache';
import Range from './Range';
import CategoryData from './CategoryData';
import Category from './Category';

export default class StockyardReportParser {
    constructor() {
        this.Head = Parse.digit.atLeastOnce().text().select(str => Number(str));  
        this.Weight = Parse.digit.atLeastOnce().text().select(str => Number(str));  

        this.WeightRange = Parse.query(function*() {
            const min = yield this.Weight;
            const dash = yield Parse.char('-').once();
            const max = yield this.Weight;
        
            return Parse.return(new Range(min, max));
        }.bind(this));

        this.WeightColumn = this.WeightRange.or(this.Weight.select(w => new Range(w, w)));

        this.AvgPrice = Parse.query(function*() {
            const dollars = yield Parse.digit.atLeastOnce().text();
            const period = yield Parse.char('.');
            const cents = yield Parse.digit.repeat(2).text();
        
            return Parse.return(parseFloat(dollars + "." + cents));
        });

        this.PriceRange = Parse.query(function*() {
            const min = yield this.AvgPrice;
            const dash = yield Parse.char('-').once();
            const max = yield this.AvgPrice;
        
            return Parse.return(new Range(min, max));
        }.bind(this));

        this.PriceColumn = this.PriceRange.or(this.AvgPrice.select(p => new Range(p, p)));

        this.EOL = Parse.char('\n').atLeastOnce();
        
        this.Notes = Parse.query(function*() {
            const note = yield Parse.letterOrDigit.or(Parse.whiteSpace).or(Parse.char('-')).many().text();
        
            return Parse.return(note);
        }.bind(this));

        this.CategoryData = Parse.query(function*() {
            const head = yield this.Head.token();
            const weightRange = yield this.WeightColumn.token();
            const averageWeight = yield this.Weight.token();
            const priceRange = yield this.PriceColumn.token();
            const averagePrice = yield this.AvgPrice.token();
            const notes = yield this.Notes.optional();
            const end = yield this.EOL;
        
            return Parse.return(new CategoryData(
                head,
                weightRange,
                averageWeight,
                priceRange,
                averagePrice,
                notes
            ));
        }.bind(this));

        this.Whitespace = Parse.whiteSpace.many();

        this.CategoryLabel = Parse.query(function*() {
            const leadingWhitespace = yield this.Whitespace.optional();
            const label = yield Parse.anyChar.except(Parse.char('\n')).atLeastOnce().text();
            const end = yield this.EOL;

            return Parse.return(label.trim());
        }.bind(this));

        this.Category = Parse.query(function*() {
            const label = yield this.CategoryLabel;
            const columnHeader = yield Parse.string("Head   Wt Range   Avg Wt    Price Range   Avg Price").token();
            const newLine = yield this.EOL;
            const data = yield this.CategoryData.atLeastOnce();
            const notes = yield this.Paragraph.optional();
            const leadingWhitespace = yield this.Whitespace.optional();
            const end = yield this.EOL.optional();

            return Parse.return(new Category(label, data));
        }.bind(this));

        this.Subcategory = Parse.query(function*() {
            const label = yield this.CategoryLabel;
            const columnHeader = yield Parse.string("Head   Wt Range   Avg Wt    Price Range   Avg Price").optional().token();
            const newLine = yield this.EOL.optional();
            const data = yield this.CategoryData.atLeastOnce();
            const end = yield this.EOL.optional();

            return Parse.return(new Category(label, data));
        }.bind(this));

        this.CategoryWithSubsections = Parse.query(function*() {
            const label = yield Parse.letter.or(Parse.char(' ')).except(Parse.string('  ')).atLeastOnce().text();
            const subCategories = yield this.Subcategory.atLeastOnce();

            return Parse.return(new Category(label, subCategories));
        }.bind(this));

        this.NonBlankLine = Parse.query(function*() {
            const text = yield Parse.anyChar.except(Parse.char('\n')).many().text();
            const end = yield this.EOL;

            return Parse.return(text.trim());
        }.bind(this));

        this.Paragraph = Parse.query(function*() {
            const leadingWhitespace = yield this.Whitespace.optional();
            const text = yield this.NonBlankLine.atLeastOnce();

            return Parse.return(text.join('\n'));
        }.bind(this));

        this.Report = Parse.query(function*() {
            const content = yield this.Category.or(this.CategoryWithSubsections).many();
            const footer = yield Parse.anyChar.many();
            
            return Parse.return(content);
        }.bind(this));
    }
    
}
