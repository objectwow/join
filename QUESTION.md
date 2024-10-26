# Questions

## 1: Why is the original local object overwritten by default?

Because we don’t want memory leaks when cloning large objects. With the overwrite behavior, object references will be reusable, and memory will be used efficiently. Only small temporary data is created at each step and released when it’s no longer needed

If you prefer not to use this behavior, you can:

### Solution 1: Deep clone your local object

- const cloneLocal = JSON.parse(JSON.stringify(localObject))
- Use cloneLocal at joinData local parameter

### Solution 2: Customize the behavior, as mentioned in the [#Customize](https://github.com/objectwow/join#Customization):

- Overwrite standardizeLocalParam to return JSON.parse(JSON.stringify(local))
- Overwrite generateResult to return localOverwrite
- Follow the next steps in the `Customized usage`
