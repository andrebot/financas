import chai from 'chai';
import calculateTax from '../../../src/server/engine/taxEngine';

chai.should();

describe('taxEngine', () => {
  describe('calculateTax', () => {
    it('should return 0 when grossIncome is zero', () => {
      calculateTax('cdb', 0, 200).should.equal(0);
    });

    it('should return 0 when grossIncome is negative', () => {
      calculateTax('cdb', -50, 200).should.equal(0);
    });

    it('should return 0 for exempt type lci', () => {
      calculateTax('lci', 1000, 400).should.equal(0);
    });

    it('should return 0 for exempt type lca', () => {
      calculateTax('lca', 1000, 400).should.equal(0);
    });

    it('should return 0 for non-fixed-income type stock', () => {
      calculateTax('stock', 1000, 400).should.equal(0);
    });

    it('should return 0 for non-fixed-income type crypto', () => {
      calculateTax('crypto', 500, 100).should.equal(0);
    });

    it('should apply 22.5% for holding period up to 180 days', () => {
      calculateTax('cdb', 1000, 180).should.equal(225);
    });

    it('should apply 22.5% for holding period of exactly 1 day', () => {
      calculateTax('cdb', 1000, 1).should.equal(225);
    });

    it('should apply 20% for holding period between 181 and 360 days', () => {
      calculateTax('cdb', 1000, 181).should.equal(200);
      calculateTax('cdb', 1000, 360).should.equal(200);
    });

    it('should apply 17.5% for holding period between 361 and 720 days', () => {
      calculateTax('cdb', 1000, 361).should.equal(175);
      calculateTax('cdb', 1000, 720).should.equal(175);
    });

    it('should apply 15% for holding period over 720 days', () => {
      calculateTax('cdb', 1000, 721).should.equal(150);
      calculateTax('cdb', 1000, 1000).should.equal(150);
    });

    it('should work for cri type', () => {
      calculateTax('cri', 2000, 500).should.equal(350);
    });

    it('should work for cra type', () => {
      calculateTax('cra', 2000, 500).should.equal(350);
    });

    it('should work for debenture type', () => {
      calculateTax('debenture', 1000, 90).should.equal(225);
    });

    it('should work for tresury type', () => {
      calculateTax('tresury', 1000, 90).should.equal(225);
    });

    it('should round to 2 decimal places', () => {
      calculateTax('cdb', 100, 90).should.equal(22.5);
      calculateTax('cdb', 333.33, 90).should.equal(75);
    });
  });
});
