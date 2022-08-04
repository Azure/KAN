package main

import (
	"github.com/azure/percept-for-oss/cli/cmd"
)

// Version value is injected by the build.
var (
	version = ""
)

func main() {
	cmd.Execute(version)
}
