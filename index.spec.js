const { createReport } = require('./index.js');

describe('createReport', () => {
  it('should error if template is not passed', () => {
    expect(() => {
      createReport();
    }).toThrow('required argument "template" is not passed');
  });

  it('should create report', () => {
    let report;

    expect(() => {
      report = createReport({});
    }).not.toThrow();

    expect(report).toBeDefined();
  });

  it('should return static field', () => {
    const report = createReport({
      A: 42,
    });

    expect(report.A).toEqual(42);
  });

  it('should calculate field', () => {
    const report = createReport({
      A: () => 42,
    });

    expect(report.A).toEqual(42);
  });

  it('should calculate field using static field', () => {
    const report = createReport({
      A: 42,
      B: ({ A }) => A,
    });

    expect(report.B).toEqual(42);
  });

  it('should calculate field based on another', () => {
    const report = createReport({
      A: () => 42,
      B: ({ A }) => A + 1,
    });

    expect(report.B).toEqual(42 + 1);
  });

  it('should calculate field based on two fields', () => {
    const report = createReport({
      A: () => 42,
      B: () => 4,
      C: ({ A, B }) => A + B,
    });

    expect(report.C).toEqual(46);
  });

  it('should calculate field from a chain', () => {
    expect(
      createReport({
        A: () => 2,
        B: ({ A }) => A + 2,
        C: ({ B }) => B + 2,
      }).C
    ).toEqual(6);

    expect(
      createReport({
        A: () => 1,
        B: ({ A }) => A + 1,
        C: ({ A, B }) => A + B + 1,
      }).C
    ).toEqual(4);
  });

  it('should execute field function only once', () => {
    const calculateA = jest.fn(() => 1);

    const report = createReport({
      A: calculateA,
    });

    expect(calculateA.mock.calls.length).toEqual(0);

    report.A;
    report.A;
    report.A;

    expect(calculateA.mock.calls.length).toEqual(1);
  });

  it('should execute field only once for chained call', () => {
    const calculateA = jest.fn(() => 1);

    const report = createReport({
      A: calculateA,
      B: ({ A }) => A,
    });

    expect(calculateA.mock.calls.length).toEqual(0);

    report.B;
    report.B;
    report.B;

    expect(calculateA.mock.calls.length).toEqual(1);
  });

  it('should execute field only once for chained call', () => {
    const calculateA = jest.fn(() => 1);

    const report = createReport({
      A: calculateA,
      B: ({ A }) => A,
      C: ({ B, A }) => B + A,
    });

    expect(calculateA.mock.calls.length).toEqual(0);

    report.C;

    expect(calculateA.mock.calls.length).toEqual(1);
  });

  it('should update static field', () => {
    const report = createReport({
      A: 10,
    });

    expect(report.A).toEqual(10);

    report.A = 42;

    expect(report.A).toEqual(42);
  });

  it('should error if dynamic field is set', () => {
    const report = createReport({
      A: () => 10,
    });

    expect(report.A).toEqual(10);

    expect(() => {
      report.A = 20;
    }).toThrow('Dynamic field "A" cannot be set');

    expect(report.A).toEqual(10);
  });

  it('should update calculated field if dependent static field was updated', () => {
    const report = createReport({
      A: 10,
      B: ({ A }) => A,
    });

    expect(report.B).toEqual(10);

    report.A = 42;

    expect(report.B).toEqual(42);
  });

  it('should recalculate field only once on dependencies update', () => {
    const calculateB = jest.fn(({ A }) => A);

    const report = createReport({
      A: 10,
      B: calculateB,
    });

    expect(calculateB.mock.calls.length).toEqual(0);

    report.A = 42;
    report.B;

    expect(calculateB.mock.calls.length).toEqual(1);

    report.A = 12;

    expect(calculateB.mock.calls.length).toEqual(1);

    report.B;

    expect(calculateB.mock.calls.length).toEqual(2);
  });

  it('should recalculate chained field only once on dependencies update', () => {
    const calculateB = jest.fn(({ A }) => A);
    const calculateC = jest.fn(({ B, A }) => B + A);

    const report = createReport({
      A: 1,
      B: calculateB,
      C: calculateC,
    });

    expect(calculateB.mock.calls.length).toEqual(0);
    expect(calculateC.mock.calls.length).toEqual(0);

    expect(report.C).toEqual(2);

    expect(calculateB.mock.calls.length).toEqual(1);
    expect(calculateC.mock.calls.length).toEqual(1);

    report.A = 2;
    expect(report.C).toEqual(4);

    expect(calculateB.mock.calls.length).toEqual(2);
    expect(calculateC.mock.calls.length).toEqual(2);
  });

  it('should recalculate deeply chained field', () => {
    const report = createReport({
      field0: 0,
      ...new Array(100)
        .fill(null)
        .reduce((acc, _, i) => {
          acc[`field${i + 1}`] = ({ [`field${i}`]: v }) => v + 1;

          return acc;
        }, {}),
    });

    expect(report.field100).toEqual(100);

    report.field0 = 100;

    expect(report.field100).toEqual(200);
  });
});
