'reach 0.1';

// No `master`, so this demonstrates default fails to "main"
import { fourTimesThree } from
  '@github.com:reach-sh/reach-example-package:src/lib.rsh';

import './local.rsh';

export const main = Reach.App(() => {
  assert(fourTimesThree == 12);
  assert(fiveTimesThree == 15);
  assert(t3(6)          == 18);
});
