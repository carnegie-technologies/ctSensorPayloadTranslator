# Payload Decoder Tool

A tool for decoding decrypted, base64 encoded, sensor payloads from Carnegie Technologies'
sensors into human-readable JSON. The decoder functions are standalone from the tool and
can also be used as examples for implementing sensor decoders in other projects.

This tool supports the following Carnegie sensors:

* HybridGps/Asset Tracker v2
* Push button (1 and 3 button)
* Level sensor

This tool only supports decoding messages containing sensor readings, it cannot be used to
decode other messages that may be sent by the sensors.

## Usage

Install from npm

with npm
```bash
npm install -g @carnegietech/ct-sensor-payload-decoder
```

or with yarn

```bash
yarn global add @carnegietech/ct-sensor-payload-decoder
```

after installing, ct-sensor-payload-decoder can be run with

```bash
ct-sensor-payload-decoder
```

## Compile it yourself

Clone the repo and run

```bash
yarn
make compile
```

Then run the tool with
```bash
build/ct-sensor-payload-decoder
```

## Commands

The main command the tool offers is `decode`.
This command requires a `payload` argument.
```bash
ct-sensor-payload-decoder decode --payload="AAAAChkoAwTBgHjgSdQqhGSDa/gWdtbrwwAFCzxQ"
```

This will attempt to choose the correct decoder for the given payload.
If you wish, you can also force the choice of decoder.
```bash
ct-sensor-payload-decoder decode --decoder="hybridGps" --payload="AAAAChkoAwTBgHjgSdQqhGSDa/gWdtbrwwAFCzxQ"
```
