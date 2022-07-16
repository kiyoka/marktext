/* eslint-disable no-useless-escape */

/**
 * Block-Level Rules
 */

export const block = {
  lheading: /^([^\n]+)\n {0,3}(=+|-+) *(?:\n+|$)/,
  bullet: /^([*+-])|\d{1,9}(\.|\))/,
  footnote: /^\[\^([^\^\[\]\s]+?)(?<!\\)\]:[\s\S]+?(?=\n *\n {0,3}[^ ]+|$)/
}

/* eslint-ensable no-useless-escape */
