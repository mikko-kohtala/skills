# Java Scripts

Java with Maven dependency support.

## Conventions

- Main public class with `public static main()` method
- Dependencies: `//requirements://groupId:artifactId:version` at top
- Method signature: `public static Object main(parameters...)`

## Example

```java
//requirements:
//com.google.code.gson:gson:2.10.1

import com.google.gson.Gson;
import java.util.HashMap;
import java.util.Map;

public class Main {
    public static Object main(String name, Integer count) {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Hello " + name + "!");
        result.put("count", count != null ? count : 1);
        return result;
    }
}
```
