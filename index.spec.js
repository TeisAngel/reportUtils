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

  it('should update calculated field if dependent static field was updated', () => {
    const report = createReport({
      A: 10,
      B: ({ A }) => A,
    });

    expect(report.B).toEqual(10);

    report.A = 42;

    expect(report.B).toEqual(42);
  });
});
