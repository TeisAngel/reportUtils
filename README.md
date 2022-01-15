# Report utils

This package allows to describe chained calculations declaratively.

```JavaScript
const report = createReport({
  A: 1,
  B: 3,
  SUM: ({ A, B }) => A + B,
});

report.A; // => 1
report.B; // => 3
report.SUM; // => 4
```

Under the hood the package tracks accessed values from function parameters. These values are dependencies for the field. In the example above field `SUM` dependents on two fields: `A` and `B`.

Any dependency change will trigger recalculation for the field:

```JavaScript
const report = createReport({
  A: 1,
  B: 3,
  SUM: ({ A, B }) => A + B,
});

report.SUM; // => 4

report.B = 41;

report.SUM; // => 42
```

Dynamic values can depend on other dynamic fields:

```JavaScript
const report = createReport({
  A: 1,
  B: ({ A }) => A + 1,
  C: ({ B }) => B + 1,
});

report.C; // => 3
```


All values in the report are lazy evaluated and cached:

```JavaScript
const report = createReport({
  A: 1,
  B: 3,
  SUM: ({ A, B }) => {
    console.log('Calculating SUM');
    return A + B;
  },
});

report.SUM; // => 4

report.B = 41;

report.SUM; // => 42
report.SUM;
report.SUM;

// Console output:
// 1. Calculating SUM
// 2. Calculating SUM
```
