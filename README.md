
# `cairo-docgen`

A lightweight documentation generator for Starknet Cairo smart contracts. Generates a Markdown documentation file from [NATSPEC](https://docs.soliditylang.org/en/v0.8.17/natspec-format.html) comments.

## Notes & Known Limitations
* Please note that this tool only parses functions and events in the input file. If your smart contract has external functions or events that are defined in a file other than the main contract file, they will not be parsed.
* This tool has only been tested with Cairo lang v0.10.x and may have issues with other versions.

## Usage

```
npx cairo-docgen <input_file_path> [output_dir]
```


## Example

Given the following file as input:
```
%lang starknet

from starkware.cairo.common.cairo_builtins import BitwiseBuiltin, HashBuiltin

@storage_var
func CatName() -> (res: felt) {
}

/// @notice Emitted when the cat name is set to a new value.
/// @param newCatName The new name of the cat that was set.
@event
func CatNameSet(newCatName: felt) {
}

/// @notice Fetches the name of the cat.
/// @dev Will return 0 if the cat name was never set.
/// @return catName The current name of the cat.
@view
func getCatName{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (catName: felt) {
    let (catName) = CatName.read();

    return (catName,);
}

/// @notice Sets the name of the cat.
/// @param catName The new cat name.
@external
func setCatName{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(catName: felt) {
    CatName.write(catName);
    return ();
}
```

The generated Markdown documentation file will be:
```
# View Functions

### getCatName

`func getCatName() -> (catName: felt)`

Fetches the name of the cat.

Will return 0 if the cat name was never set.

Outputs
| Name | Type | Description |
|------|------|-------------|
| `catName` | `felt` |  The current name of the cat.  |

# External Functions

### setCatName

`func setCatName(catName: felt)`

Sets the name of the cat.


Inputs

| Name | Type | Description |
|------|------|-------------|
| `catName` | `felt` |  The new cat name.  |

# Events

### CatNameSet

`func CatNameSet(newCatName: felt)`

Emitted when the cat name is set to a new value.


Outputs

| Name | Type | Description |
|------|------|-------------|
| `newCatName` | `felt` |  The new name of the cat that was set.  |
```