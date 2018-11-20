const tracing = require('@opencensus/nodejs');
const zipkin = require('@opencensus/exporter-zipkin');
const stdin = process.openStdin();

// 1. Get the global singleton Tracer object
// 2. Configure 100% sample rate, otherwise, few traces will be sampled.
const tracer = tracing.start({samplingRate: 1}).tracer;

// 3. Configure exporter to export traces to Zipkin.
tracer.registerSpanEventListener(new zipkin.ZipkinTraceExporter({
    url: 'http://localhost:9411/api/v2/spans',
    serviceName: 'node.js-quickstart'
}));

function main() {
  // 4. Create a span. A span must be closed.
  tracer.startRootSpan({name: 'main'}, rootSpan => {
    for (let i = 0; i < 10; i++) {
      doWork();
    }

    rootSpan.end();
  });
}

function doWork() {
  // 5. Start another span. In this example, the main method already started a span,
  // so that'll be the parent span, and this will be a child span.
  const span = tracer.startChildSpan('doWork');
  span.start();

  console.log('doing busy work');
  for (let i = 0; i <= 40000000; i++) {} // short delay

  // 6. Annotate our span to capture metadata about our operation
  span.addAnnotation('invoking doWork')
  for (let i = 0; i <= 20000000; i++) {} // short delay

  span.end();
}

main();
