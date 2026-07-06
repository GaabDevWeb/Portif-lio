# Virtual Filesystem (VFS)

Unix-like virtual filesystem mapped to `/content` data.

## Structure

```
features/vfs/
├── content-loader.ts    # Builds tree from content data
├── virtual-filesystem.ts # Path resolution + read/list
└── index.ts             # Singleton accessor
```

## Paths

Default cwd: `/home/guest`

See masterplan §10 for full tree.

## Extension

1. Add content under `/content`
2. Mirror in `content-loader.ts` or `content-data/`
3. Add VFS tests
