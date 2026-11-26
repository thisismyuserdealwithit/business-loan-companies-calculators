# Changes

## 2.0.1, 17 November 2026

Recovered the site's published October 2026 v2.0 code and retained its attribution permission.

* Reject blank whitespace, booleans, arrays and objects as calculator numeric inputs. Finite numeric strings remain supported.
* Return null for malformed, sparse or non-finite periodic APR schedules and non-finite principal/frequency inputs.
* Use log1p/expm1 for the existing amortizing payment formula to avoid cancellation at tiny positive interest rates.
* Add an ESM build, a browser build, package metadata, documented assumptions and independent calculation fixtures.

This source distribution preserves the original site download alongside the adapted files.
