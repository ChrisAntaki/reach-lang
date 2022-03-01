'reach 0.1';

export const main =
  Reach.App(
    {},
    [ Participant('A', {
        getA: Fun([], Array(UInt, 5)),
      }),
    ],
    (A) => {
      A.only(() => {
        const xs = declassify(interact.getA());
        const ys = array(UInt, [0, 1, 2, 3, 4]);
        const mapped = Array.map(xs, ys, (x, y) => x + y);
        const z = Array.reduce(xs, ys, mapped, 0, (x, y, m, z) => z + m - x - y);
      });
      A.publish(z);
      commit();
      exit();
    }
  );
