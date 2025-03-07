// サンプルネットワークデータ
export const sampleNetworkData = {
  nodes: [
    { id: "1", label: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", type: "source" },
    { id: "2", label: "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy", type: "target" },
    { id: "3", label: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq", type: "target" },
    { id: "4", label: "bc1qc7slrfxkknqcq2jevvvkdgvrt8080852dfjewde450xdlk4ugp7szw5tk9", type: "target" },
    { id: "5", label: "bc1q9d4ywgfnd8h43da5tpcxcn6ajv590cg6d3tg6axemvljvt2k76zs50tv4q", type: "target" },
    { id: "6", label: "3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5", type: "target" },
    { id: "7", label: "bc1qjh0akslml59uuczddqu0y4p3vj64hg6qa8tac2", type: "target" },
    { id: "8", label: "bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h", type: "target" },
    { id: "9", label: "bc1qn9nfs5nkw8rtsm9xq9ghq6rjr5gpnqm7nmwh7c", type: "target" },
    { id: "10", label: "bc1qp5kqpsxzuxent6yvn8ttzd5p4sd7t5xz5f0pc9", type: "target" },
    // 第2階層のノード
    { id: "11", label: "bc1qr5d8dk4kj3fz9m7z7twlwwwj9j5zhkxr9rnzl3", type: "target" },
    { id: "12", label: "bc1qs6z9q58dqunfqv48xanwduqj4r4gwazlsqnzv9", type: "target" },
    { id: "13", label: "bc1qt3pzuhml5rz7kq0rj8a7q7aanlhv4yz5m8mbjl", type: "target" },
    { id: "14", label: "bc1qu8te3r9hk2qk7g4dzhw6yrtn0yrw4fjmcfzsjl", type: "target" },
    { id: "15", label: "bc1qvs9xvz4kz0mdxg9lnuqzh5vqsjsnzdjw5tz9jl", type: "target" },
  ],
  links: [
    { id: "1-2", source: "1", target: "2", value: 0.5 },
    { id: "1-3", source: "1", target: "3", value: 1.2 },
    { id: "1-4", source: "1", target: "4", value: 0.8 },
    { id: "1-5", source: "1", target: "5", value: 2.3 },
    { id: "1-6", source: "1", target: "6", value: 0.7 },
    { id: "1-7", source: "1", target: "7", value: 1.5 },
    { id: "1-8", source: "1", target: "8", value: 0.3 },
    { id: "1-9", source: "1", target: "9", value: 1.0 },
    { id: "1-10", source: "1", target: "10", value: 0.6 },
    // 第2階層のリンク
    { id: "2-11", source: "2", target: "11", value: 0.4 },
    { id: "3-12", source: "3", target: "12", value: 0.9 },
    { id: "4-13", source: "4", target: "13", value: 1.1 },
    { id: "5-14", source: "5", target: "14", value: 0.2 },
    { id: "6-15", source: "6", target: "15", value: 1.3 },
  ]
};
