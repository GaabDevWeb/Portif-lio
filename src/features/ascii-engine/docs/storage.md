# Storage

Persistência de projetos (PLATFORM §3.12).

## ProjectStore (IndexedDB)
DB `ascii-engine-projects` · store `projects`  
`put` / `get` / `list` / `delete`

## Project ZIP
`exportProjectZip` / `importProjectZip` / `downloadProjectZip`

```
name.ascii-project.zip
├── manifest.json
├── document.json
├── README.txt
├── assets/          (opcional)
└── preview.png      (opcional)
```

Blob-first; download só via browser adapter.
