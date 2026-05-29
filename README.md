## .env

```
.
└── env/
    ├── template.env
    └── {package}.{env}.env
```

## Usage

```
node . [options]
```

## Options

```
-d, --domain
  specify domain

-e, --env
  specify environment

--test
  test connection

--init
  initialize remote machine

--package
  build config

--deploy
  build and deploy config

--jump
  use jump host

-m, --message
  commit message
```

## Example

```
node . -d demo -e uat --test
```

```
node . -d demo -e uat --init
```

```
node . -d demo -e uat --deploy
```

```
node . -d demo -e uat --package
```
