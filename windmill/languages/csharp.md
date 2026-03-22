# C# Scripts

C# with .NET runtime and NuGet package support.

## Conventions

- Public static `Main` method inside a class
- NuGet packages: `#r "nuget: PackageName, Version"` at top
- Method signature: `public static ReturnType Main(parameters...)`

## Example

```csharp
#r "nuget: Newtonsoft.Json, 13.0.3"

using Newtonsoft.Json;
using System.Collections.Generic;

public class Main
{
    public static Dictionary<string, object> main(string name, int count = 1)
    {
        return new Dictionary<string, object>
        {
            { "message", $"Hello {name}!" },
            { "count", count }
        };
    }
}
```
