class HttpHeadersCarrier {
  inject(spanContext) {
    const header = {};
    header['x-b3-traceId'] = spanContext.traceId;
    header['x-b3-spanId'] = spanContext.spanId;
    const baggage = spanContext.getBaggages();
    if (baggage) header['x-b3-baggage'] = JSON.stringify(baggage);
    return header;
  }

  extract(header) {
    const traceId = header['x-b3-traceid'];
    const spanId = header['x-b3-spanid'];
    let baggage = header['x-b3-baggage'];
    if (baggage) baggage = JSON.parse(baggage);
    // 转换
    return { traceId, spanId, baggage };
  }
}

module.exports = HttpHeadersCarrier;
