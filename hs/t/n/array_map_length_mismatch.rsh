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
        const x = declassify(interact.getA());
        const y = array(UInt, [0, 1, 2]);
        const z = Array.map(x, y, (l, r) => l + r);
      });
      A.publish(z);
      commit();
      exit();
    }
  );
