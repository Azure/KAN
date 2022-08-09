package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var RootCmd = &cobra.Command{
	Use:   "p4ectl",
	Short: "p4ectl",
	Long: `
	
	P 4 E C T L
	
	`,
	Run: func(cmd *cobra.Command, args []string) {
	},
}

func Execute(versiong string) {
	if err := RootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(-1)
	}
}

func init() {

}
