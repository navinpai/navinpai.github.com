/* Illustrative model-only scenario. Backend and operating costs are separate. */
(() => {
  'use strict';
  const rates = Object.freeze({
    small: Object.freeze({input: 1, output: 5}),
    standard: Object.freeze({input: 3, output: 15}),
    premium: Object.freeze({input: 5, output: 25}),
    scanGB: 0.005
  });
  const tokens = (input, output, tier = 'premium') =>
    (input * rates[tier].input + output * rates[tier].output) / 1e6;
  const unit = Object.freeze({
    classify: tokens(5000, 1000, 'small'),
    group: tokens(30000, 2000, 'small'),
    investigate: tokens(500000, 60000),
    bounded: tokens(120000, 12000, 'standard') + tokens(40000, 2000, 'small'),
    remediate: tokens(100000, 40000)
  });
  function calculate(alerts = 1000, policy = 'all') {
    if (!Number.isFinite(alerts) || alerts < 0) throw new RangeError('Alert volume must be a non-negative number.');
    if (!['all', 'admit', 'lean'].includes(policy)) throw new RangeError('Unknown cost policy.');
    const eligible = policy === 'all' ? alerts : alerts * 0.4;
    const investigations = policy === 'all' ? alerts : eligible / 4;
    const remediationAttempts = alerts * 0.005;
    const classify = policy === 'all' ? 0 : eligible * unit.classify * 30;
    const group = policy === 'all' ? 0 : eligible * unit.group * 30;
    const investigate = investigations * (policy === 'lean' ? unit.bounded : unit.investigate) * 30;
    const remediate = remediationAttempts * unit.remediate * 30;
    return { alerts, eligible, investigations, remediationAttempts, classify, group, investigate, remediate,
      monthly: classify + group + investigate + remediate };
  }
  const model = Object.freeze({ rates, unit, tokens, calculate });
  if (typeof module !== 'undefined' && module.exports) module.exports = model;
  else window.AISRECost = model;
})();
