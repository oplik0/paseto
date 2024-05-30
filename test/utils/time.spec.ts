import { expect } from "@std/expect";
import { parseTime, parseTimeString } from "../../lib/utils/time.ts";

Deno.test("parseTimeString throws with an invalid time string", () => {
  expect(() => parseTimeString("foo")).toThrow();
});

Deno.test("parseTime throws with an invalid time", () => {
  expect(() => parseTime("foo" as any)).toThrow();
});

Deno.test("parses a time from an ISO string", () => {
  const t = "2023-01-09T15:34:46.865Z";
  const result = parseTime(t);
  const d = new Date(t);
  expect(typeof result).toBe("object");
  expect(result).toBeInstanceOf(Date);
  expect(result.getTime()).toBe(d.getTime());
});

Deno.test("parses a time from a number", () => {
  const result = parseTime(1631104486865);
  expect(typeof result).toBe("object");
  expect(result).toBeInstanceOf(Date);
  expect(result.getTime() - 1631104486865).toBeLessThan(1000);
});

Deno.test("parses a time from a Date object", () => {
  const result = parseTime(new Date(1631104486865));
  expect(typeof result).toBe("object");
  expect(result).toBeInstanceOf(Date);
  expect(result.getTime() - 1631104486865).toBeLessThan(1000);
});

Deno.test("parses a time from a time string (1s 1sec 1secs 1second 1seconds, 1 s 1 sec 1 secs 1 second 1 seconds)", () => {
  const result = parseTime("1s");
  expect(typeof result).toBe("object");
  expect(result).toBeInstanceOf(Date);
  expect(result.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );

  const result2 = parseTime("1sec");
  expect(typeof result2).toBe("object");
  expect(result2).toBeInstanceOf(Date);
  expect(result2.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );

  const result3 = parseTime("1secs");
  expect(typeof result3).toBe("object");
  expect(result3).toBeInstanceOf(Date);
  expect(result3.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );

  const result4 = parseTime("1second");
  expect(typeof result4).toBe("object");
  expect(result4).toBeInstanceOf(Date);
  expect(result4.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );

  const result5 = parseTime("1seconds");
  expect(typeof result5).toBe("object");
  expect(result5).toBeInstanceOf(Date);
  expect(result5.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );

  const result6 = parseTime("1 s");
  expect(typeof result6).toBe("object");
  expect(result6).toBeInstanceOf(Date);
  expect(result6.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );

  const result7 = parseTime("1 sec");
  expect(typeof result7).toBe("object");
  expect(result7).toBeInstanceOf(Date);
  expect(result7.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );

  const result8 = parseTime("1 secs");
  expect(typeof result8).toBe("object");
  expect(result8).toBeInstanceOf(Date);
  expect(result8.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );

  const result9 = parseTime("1 second");
  expect(typeof result9).toBe("object");
  expect(result9).toBeInstanceOf(Date);
  expect(result9.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );

  const result10 = parseTime("1 seconds");
  expect(typeof result10).toBe("object");
  expect(result10).toBeInstanceOf(Date);
  expect(result10.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );
});

Deno.test("parses a time from a time string (1m 1min 1mins 1minute 1minutes, 1 m 1 min 1 mins 1 minute 1 minutes)", () => {
  const result = parseTime("1m");
  expect(typeof result).toBe("object");
  expect(result).toBeInstanceOf(Date);
  expect(result.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );

  const result2 = parseTime("1min");
  expect(typeof result2).toBe("object");
  expect(result2).toBeInstanceOf(Date);
  expect(result2.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );

  const result3 = parseTime("1mins");
  expect(typeof result3).toBe("object");
  expect(result3).toBeInstanceOf(Date);
  expect(result3.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );

  const result4 = parseTime("1minute");
  expect(typeof result4).toBe("object");
  expect(result4).toBeInstanceOf(Date);
  expect(result4.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );

  const result5 = parseTime("1minutes");
  expect(typeof result5).toBe("object");
  expect(result5).toBeInstanceOf(Date);
  expect(result5.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );

  const result6 = parseTime("1 m");
  expect(typeof result6).toBe("object");
  expect(result6).toBeInstanceOf(Date);
  expect(result6.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );

  const result7 = parseTime("1 min");
  expect(typeof result7).toBe("object");
  expect(result7).toBeInstanceOf(Date);
  expect(result7.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );

  const result8 = parseTime("1 mins");
  expect(typeof result8).toBe("object");
  expect(result8).toBeInstanceOf(Date);
  expect(result8.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );

  const result9 = parseTime("1 minute");
  expect(typeof result9).toBe("object");
  expect(result9).toBeInstanceOf(Date);
  expect(result9.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );

  const result10 = parseTime("1 minutes");
  expect(typeof result10).toBe("object");
  expect(result10).toBeInstanceOf(Date);
  expect(result10.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );
});

Deno.test("parses a time from a time string (1h 1hr 1hrs 1hour 1hours, 1 h 1 hr 1 hrs 1 hour 1 hours)", () => {
  const result = parseTime("1h");
  expect(typeof result).toBe("object");
  expect(result).toBeInstanceOf(Date);
  expect(result.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );

  const result2 = parseTime("1hr");
  expect(typeof result2).toBe("object");
  expect(result2).toBeInstanceOf(Date);
  expect(result2.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );

  const result3 = parseTime("1hrs");
  expect(typeof result3).toBe("object");
  expect(result3).toBeInstanceOf(Date);
  expect(result3.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );

  const result4 = parseTime("1hour");
  expect(typeof result4).toBe("object");
  expect(result4).toBeInstanceOf(Date);
  expect(result4.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );

  const result5 = parseTime("1hours");
  expect(typeof result5).toBe("object");
  expect(result5).toBeInstanceOf(Date);
  expect(result5.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );

  const result6 = parseTime("1 h");
  expect(typeof result6).toBe("object");
  expect(result6).toBeInstanceOf(Date);
  expect(result6.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );

  const result7 = parseTime("1 hr");
  expect(typeof result7).toBe("object");
  expect(result7).toBeInstanceOf(Date);
  expect(result7.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );

  const result8 = parseTime("1 hrs");
  expect(typeof result8).toBe("object");
  expect(result8).toBeInstanceOf(Date);
  expect(result8.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );

  const result9 = parseTime("1 hour");
  expect(typeof result9).toBe("object");
  expect(result9).toBeInstanceOf(Date);
  expect(result9.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );

  const result10 = parseTime("1 hours");
  expect(typeof result10).toBe("object");
  expect(result10).toBeInstanceOf(Date);
  expect(result10.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );
});

Deno.test("parses a time from a time string (1d 1day 1days, 1 d 1 day 1 days)", () => {
  const result = parseTime("1d");
  expect(typeof result).toBe("object");
  expect(result).toBeInstanceOf(Date);
  expect(result.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );

  const result2 = parseTime("1day");
  expect(typeof result2).toBe("object");
  expect(result2).toBeInstanceOf(Date);
  expect(result2.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );

  const result3 = parseTime("1days");
  expect(typeof result3).toBe("object");
  expect(result3).toBeInstanceOf(Date);
  expect(result3.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );

  const result4 = parseTime("1 d");
  expect(typeof result4).toBe("object");
  expect(result4).toBeInstanceOf(Date);
  expect(result4.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );

  const result5 = parseTime("1 day");
  expect(typeof result5).toBe("object");
  expect(result5).toBeInstanceOf(Date);
  expect(result5.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );

  const result6 = parseTime("1 days");
  expect(typeof result6).toBe("object");
  expect(result6).toBeInstanceOf(Date);
  expect(result6.getTime() - Date.now() - 1000 * 60 * 60 * 24).toBeLessThan(
    1000,
  );
});

Deno.test("parses a time from a time string (1w 1wk 1wks 1week 1weeks, 1 w 1 wk 1 wks 1 week 1 weeks)", () => {
  const result = parseTime("1w");
  expect(typeof result).toBe("object");
  expect(result).toBeInstanceOf(Date);
  expect(
    result.getTime() - Date.now() - 1000 * 60 * 60 * 24 * 7,
  ).toBeLessThan(1000);

  const result2 = parseTime("1wk");
  expect(typeof result2).toBe("object");
  expect(result2).toBeInstanceOf(Date);
  expect(
    result2.getTime() - Date.now() - 1000 * 60 * 60 * 24 * 7,
  ).toBeLessThan(1000);

  const result3 = parseTime("1wks");
  expect(typeof result3).toBe("object");
  expect(result3).toBeInstanceOf(Date);
  expect(
    result3.getTime() - Date.now() - 1000 * 60 * 60 * 24 * 7,
  ).toBeLessThan(1000);

  const result4 = parseTime("1week");
  expect(typeof result4).toBe("object");
  expect(result4).toBeInstanceOf(Date);
  expect(
    result4.getTime() - Date.now() - 1000 * 60 * 60 * 24 * 7,
  ).toBeLessThan(1000);

  const result5 = parseTime("1weeks");
  expect(typeof result5).toBe("object");
  expect(result5).toBeInstanceOf(Date);
  expect(
    result5.getTime() - Date.now() - 1000 * 60 * 60 * 24 * 7,
  ).toBeLessThan(1000);

  const result6 = parseTime("1 w");
  expect(typeof result6).toBe("object");
  expect(result6).toBeInstanceOf(Date);
  expect(
    result6.getTime() - Date.now() - 1000 * 60 * 60 * 24 * 7,
  ).toBeLessThan(1000);

  const result7 = parseTime("1 wk");
  expect(typeof result7).toBe("object");
  expect(result7).toBeInstanceOf(Date);
  expect(
    result7.getTime() - Date.now() - 1000 * 60 * 60 * 24 * 7,
  ).toBeLessThan(1000);

  const result8 = parseTime("1 wks");
  expect(typeof result8).toBe("object");
  expect(result8).toBeInstanceOf(Date);
  expect(
    result8.getTime() - Date.now() - 1000 * 60 * 60 * 24 * 7,
  ).toBeLessThan(1000);

  const result9 = parseTime("1 week");
  expect(typeof result9).toBe("object");
  expect(result9).toBeInstanceOf(Date);
  expect(
    result9.getTime() - Date.now() - 1000 * 60 * 60 * 24 * 7,
  ).toBeLessThan(1000);

  const result10 = parseTime("1 weeks");
  expect(typeof result10).toBe("object");
  expect(result10).toBeInstanceOf(Date);
  expect(
    result10.getTime() - Date.now() - 1000 * 60 * 60 * 24 * 7,
  ).toBeLessThan(1000);
});

Deno.test("parses a time from a time string (1mo 1mos 1month 1months, 1 mo 1 mos 1 month 1 months)", () => {
  const result = parseTime("1mo");
  expect(typeof result).toBe("object");
  expect(result).toBeInstanceOf(Date);
  expect(
    result.getTime() - Date.now() - 1000 * 60 * 60 * 24 * 30,
  ).toBeLessThan(1000);

  const result2 = parseTime("1mos");
  expect(typeof result2).toBe("object");
  expect(result2).toBeInstanceOf(Date);
  expect(
    result2.getTime() - Date.now() - 1000 * 60 * 60 * 24 * 30,
  ).toBeLessThan(1000);

  const result3 = parseTime("1month");
  expect(typeof result3).toBe("object");
  expect(result3).toBeInstanceOf(Date);
  expect(
    result3.getTime() - Date.now() - 1000 * 60 * 60 * 24 * 30,
  ).toBeLessThan(1000);

  const result4 = parseTime("1months");
  expect(typeof result4).toBe("object");
  expect(result4).toBeInstanceOf(Date);
  expect(
    result4.getTime() - Date.now() - 1000 * 60 * 60 * 24 * 30,
  ).toBeLessThan(1000);

  const result5 = parseTime("1 mo");
  expect(typeof result5).toBe("object");
  expect(result5).toBeInstanceOf(Date);
  expect(
    result5.getTime() - Date.now() - 1000 * 60 * 60 * 24 * 30,
  ).toBeLessThan(1000);

  const result6 = parseTime("1 mos");
  expect(typeof result6).toBe("object");
  expect(result6).toBeInstanceOf(Date);

  const result7 = parseTime("1 month");
  expect(typeof result7).toBe("object");
  expect(result7).toBeInstanceOf(Date);
  expect(
    result7.getTime() - Date.now() - 1000 * 60 * 60 * 24 * 30,
  ).toBeLessThan(1000);

  const result8 = parseTime("1 months");
  expect(typeof result8).toBe("object");
  expect(result8).toBeInstanceOf(Date);
  expect(
    result8.getTime() - Date.now() - 1000 * 60 * 60 * 24 * 30,
  ).toBeLessThan(1000);
});

Deno.test("parses a time from a time string (1y 1yr 1yrs 1year 1years, 1 y 1 yr 1 yrs 1 year 1 years)", () => {
  const result = parseTime("1y");
  expect(typeof result).toBe("object");
  expect(result).toBeInstanceOf(Date);
  expect(
    result.getTime() - Date.now() - 1000 * 60 * 60 * 24 * 365,
  ).toBeLessThan(1000);

  const result2 = parseTime("1yr");
  expect(typeof result2).toBe("object");
  expect(result2).toBeInstanceOf(Date);
  expect(
    result2.getTime() - Date.now() - 1000 * 60 * 60 * 24 * 365,
  ).toBeLessThan(1000);

  const result3 = parseTime("1yrs");
  expect(typeof result3).toBe("object");
  expect(result3).toBeInstanceOf(Date);
  expect(
    result3.getTime() - Date.now() - 1000 * 60 * 60 * 24 * 365,
  ).toBeLessThan(1000);

  const result4 = parseTime("1year");
  expect(typeof result4).toBe("object");
  expect(result4).toBeInstanceOf(Date);
  expect(
    result4.getTime() - Date.now() - 1000 * 60 * 60 * 24 * 365,
  ).toBeLessThan(1000);

  const result5 = parseTime("1years");
  expect(typeof result5).toBe("object");
  expect(result5).toBeInstanceOf(Date);
  expect(
    result5.getTime() - Date.now() - 1000 * 60 * 60 * 24 * 365,
  ).toBeLessThan(1000);

  const result6 = parseTime("1 y");
  expect(typeof result6).toBe("object");
  expect(result6).toBeInstanceOf(Date);
  expect(
    result6.getTime() - Date.now() - 1000 * 60 * 60 * 24 * 365,
  ).toBeLessThan(1000);

  const result7 = parseTime("1 yr");
  expect(typeof result7).toBe("object");
  expect(result7).toBeInstanceOf(Date);
  expect(
    result7.getTime() - Date.now() - 1000 * 60 * 60 * 24 * 365,
  ).toBeLessThan(1000);

  const result8 = parseTime("1 yrs");
  expect(typeof result8).toBe("object");
  expect(result8).toBeInstanceOf(Date);
  expect(
    result8.getTime() - Date.now() - 1000 * 60 * 60 * 24 * 365,
  ).toBeLessThan(1000);

  const result9 = parseTime("1 year");
  expect(typeof result9).toBe("object");
  expect(result9).toBeInstanceOf(Date);
  expect(
    result9.getTime() - Date.now() - 1000 * 60 * 60 * 24 * 365,
  ).toBeLessThan(1000);

  const result10 = parseTime("1 years");
  expect(typeof result10).toBe("object");
  expect(result10).toBeInstanceOf(Date);
  expect(
    result10.getTime() - Date.now() - 1000 * 60 * 60 * 24 * 365,
  ).toBeLessThan(1000);
});

Deno.test("it throws if date is not a string, number or date", () => {
  expect(
    () => parseTime({} as any),
    "date must be a string, number or date",
  ).toThrow();
  expect(
    () => parseTime([] as any),
    "date must be a string, number or date",
  ).toThrow();
  expect(
    () => parseTime((() => {}) as any),
    "date must be a string, number or date",
  ).toThrow();
  expect(
    () => parseTime(undefined as any),
    "date must be a string, number or date",
  ).toThrow();
  expect(
    () => parseTime(null as any),
    "date must be a string, number or date",
  ).toThrow();
  expect(
    () => parseTime(true as any),
    "date must be a string, number or date",
  ).toThrow();
  expect(
    () => parseTime(false as any),
    "date must be a string, number or date",
  ).toThrow();
  expect(
    () => parseTime(NaN as any),
    "date must be a string, number or date",
  ).toThrow();
  expect(
    () => parseTime(Infinity as any),
    "date must be a string, number or date",
  ).toThrow();
  expect(
    () => parseTime(-Infinity as any),
    "date must be a string, number or date",
  ).toThrow();
  expect(
    () => parseTime(Symbol("") as any),
    "date must be a string, number or date",
  ).toThrow();
  expect(
    () => parseTime(new Map() as any),
    "date must be a string, number or date",
  ).toThrow();
  expect(
    () => parseTime(new Set() as any),
    "date must be a string, number or date",
  ).toThrow();
  expect(
    () => parseTime(new WeakMap() as any),
    "date must be a string, number or date",
  ).toThrow();
  expect(
    () => parseTime(new WeakSet() as any),
    "date must be a string, number or date",
  ).toThrow();
  expect(
    () => parseTime(new ArrayBuffer(0) as any),
    "date must be a string, number or date",
  ).toThrow();
});
