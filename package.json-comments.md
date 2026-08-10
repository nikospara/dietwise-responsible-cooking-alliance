# Comments about the package.json

Since JSON does not allow comments and since `package.json` is central for any JS project and the
heart of its configuration, let's keep here any comments, decisions, design notes etc.

## Held back

Document any packages that are deliberately held back.

Format is:

> ### package-name - pinned version - newest version
>
> Reasoning...

## ERESOLVE when updating @vitejs/plugin-react

Bumping `@vitejs/plugin-react` can fail with:

> npm error Conflicting peer dependency: @babel/core@8.0.1
>
> peer @babel/core@"^8.0.0" from @babel/plugin-transform-runtime@8.0.1
> peerOptional @babel/plugin-transform-runtime@"^7.29.0 || ^8.0.0-rc.1" from @rolldown/plugin-babel
> peerOptional @rolldown/plugin-babel@"^0.1.7 || ^0.2.0" from @vitejs/plugin-react

`@rolldown/plugin-babel` is an optional peer of `@vitejs/plugin-react` and is not part of our tree.
Its own optional peer range on `@babel/plugin-transform-runtime` admits Babel 8, which demands
`@babel/core@^8`, while `@svgr/*` and `eslint-plugin-react-hooks` require `@babel/core@^7`. npm
walks that optional chain only when reconciling against an existing `package-lock.json`; resolving
the same `package.json` from scratch skips `@rolldown/plugin-babel` entirely and installs cleanly.

The fix is to delete the `node_modules/@babel/core` entries from `package-lock.json` and run
`npm install`, which re-resolves that node within the `^7` range. Do not reach for `--force` or
`--legacy-peer-deps`: they silence a constraint that is genuinely satisfiable. Deleting the whole
lockfile also works, but churns every transitive pin instead of the one that blocks resolution.

The workaround becomes unnecessary once `@rolldown/plugin-babel` excludes Babel 8 stable from its
peer range, or once the tree moves to `@babel/core@^8` throughout.
