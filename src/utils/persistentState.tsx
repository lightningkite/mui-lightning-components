import { Dispatch, SetStateAction, useEffect, useState } from "react";

type Encoder<T> = {
  encode: (s: T) => string;
  decode: (s: string) => T;
};

export function usePersistentState<T>(
  key: string,
  initValue: T,
  encoder: Encoder<T> = {
    encode: (v) => JSON.stringify(v),
    decode: (v) => JSON.parse(v),
  }
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [s, setS] = useState<T | "loading">("loading");

  useEffect(() => {
    if (s !== "loading") {
      localStorage.setItem(key, encoder.encode(s));
      setS(s);
    }
  }, [s, key]);

  if (s === "loading") {
    const prev = window.localStorage.getItem(key);
    const actualValue = prev === null ? initValue : encoder.decode(prev);
    setS(actualValue);
    return [actualValue, setS as Dispatch<SetStateAction<T>>];
  }

  return [s, setS as Dispatch<SetStateAction<T>>];
}
