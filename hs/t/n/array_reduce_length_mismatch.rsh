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
        const ys = array(UInt, [0, 1, 2]);
        const z = Array.reduce(xs, ys, 0, (x, y, z) => z - x + y);
      });
      A.publish(z);
      commit();
      exit();
    }
  );
