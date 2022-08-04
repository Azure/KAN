package cmd

import (
	"fmt"
	"runtime"

	"github.com/azure/percept-for-oss/cli/utils"
	"github.com/spf13/cobra"
)

var (
	verbose         bool
	symphonyVersion string
	portalVersion   string
)

var UpCmd = &cobra.Command{
	Use:   "up",
	Short: "Install P4E on a Kubernetes cluster",
	Run: func(cmd *cobra.Command, args []string) {
		if !handleKubectl() {
			return
		}
		if !handleK8sConnection() {
			return
		}
		err, _ := utils.RunCommand("Installing cert manager", "done", verbose, "kubectl", "apply", "-f", "https://github.com/jetstack/cert-manager/releases/download/v1.4.0/cert-manager.yaml")
		if err != nil {
			fmt.Printf("\n%s  Failed.%s\n\n", utils.ColorRed(), utils.ColorReset())
			return
		}
		err, _ = utils.RunCommand("Checking Helm", "found", false, "helm", "version")
		if err != nil {
			fmt.Printf("\n%s  Helm is not found. Please install Helm first. See: https://helm.sh/docs/intro/install//%s\n\n", utils.ColorRed(), utils.ColorReset())
			return
		}
		if !handleSymphony() {
			return
		}
		if !handlePortal() {
			return
		}
		err, _ = utils.RunCommand("Deploying sample solution", "done", verbose, "ls")
		if err != nil {
			fmt.Printf("\n%s  Failed.%s\n\n", utils.ColorRed(), utils.ColorReset())
			return
		}

		ret, address := checkSymphonyAddress()
		if !ret {
			return
		}
		fmt.Printf("\n%s  Done!%s\n\n", utils.ColorCyan(), utils.ColorReset())
		fmt.Printf("  %sP4E portal:%s %s%s\n", utils.ColorGreen(), utils.ColorWhite(), "UNKNOWN", utils.ColorReset())
		fmt.Printf("  %sSymphony API:%s %s%s\n", utils.ColorGreen(), utils.ColorWhite(), "http://"+address+":8080/v1alpha2/greetings", utils.ColorReset())
		fmt.Printf("  %sSample app:%s %s%s\n", utils.ColorGreen(), utils.ColorWhite(), "UNKNOWN", utils.ColorReset())
		fmt.Println()
	},
}

func init() {
	UpCmd.Flags().StringVarP(&portalVersion, "portal-version", "p", "0.36.8-amd64", "P4E Poratl version (default: voe:0.36.8-amd64)")
	UpCmd.Flags().StringVarP(&symphonyVersion, "symphony-version", "s", "0.1.57", "Symphony API version (default: 0.1.57)")
	UpCmd.Flags().BoolVar(&verbose, "verbose", false, "Detailed outputs")
	RootCmd.AddCommand(UpCmd)
}

func checkSymphonyAddress() (bool, string) {
	for {
		err, str := utils.RunCommand("Checking Symphony address", "OK", verbose, "kubectl", "get", "svc", "symphony-service-ext", "-o", "jsonpath={.status.loadBalancer.ingress[0].ip}")
		if err != nil {
			fmt.Printf("\n%s  Failed to check Symphony address./%s\n\n", utils.ColorRed(), utils.ColorReset())
			return false, ""
		}
		if str != "" {
			return true, str
		}
	}
}

func handlePortal() bool {
	_, str := utils.RunCommand("Checking P4E portal", "done", verbose, "helm", "list", "-q", "-l", "name=voe")

	if str != "voe" {
		err, _ := utils.RunCommand("Deploying P4E portal", "done", verbose, "helm", "install", "voe", "oci://p4etest.azurecr.io/helm/voe", "--version", portalVersion)
		if err != nil {
			fmt.Printf("\n%s  Failed to deploy P4E Portal.%s\n\n", utils.ColorRed(), utils.ColorReset())
			return false
		}
	}
	if verbose {
		fmt.Printf("\n%s  WARNING: existing P4E portal deployment is found. To install new version, use p4ectl remove to remove it first.%s\n\n", utils.ColorYellow(), utils.ColorReset())
	}
	return true
}

func handleSymphony() bool {
	_, str := utils.RunCommand("Checking P4E API (Symphony)", "done", verbose, "helm", "list", "-q", "-l", "name=symphony")

	if str != "symphony" {
		err, _ := utils.RunCommand("Deploying P4E API (Symphony)", "done", verbose, "helm", "install", "symphony", "oci://p4etest.azurecr.io/helm/symphony", "--version", symphonyVersion, "--set", "CUSTOM_VISION_KEY=dummy")
		if err != nil {
			fmt.Printf("\n%s  Failed.%s\n\n", utils.ColorRed(), utils.ColorReset())
			return false
		}
	}
	if verbose {
		fmt.Printf("\n%s  WARNING: existing Symphony deployment is found. To install new version, use p4ectl remove to remove it first.%s\n\n", utils.ColorYellow(), utils.ColorReset())
	}
	return true
}

func handleKubectl() bool {
	err, _ := utils.RunCommand("Checking kubectl", "found", false, "kubectl", "version")
	if err != nil {
		input := utils.GetInput("kubectl is not found. Do you want to install it? [Yes/No]", nil, utils.YesNo)
		if input == 0 {
			fmt.Printf("\n%s  Kubectl is not found. Please install kubectl first. See: https://kubernetes.io/docs/tasks/tools/%s\n\n", utils.ColorRed(), utils.ColorReset())
			return false
		} else {
			return installKubectl()
		}
	}
	return true
}
func handleK8sConnection() bool {
	err, _ := utils.RunCommand("Checking Kubernetes connection", "OK", false, "kubectl", "get", "nodes")
	if err != nil {
		input := utils.GetInput("kubectl is not connected to a Kubernetes cluster, what do you want to do?", []string{"Install a local cluster (Kind)", "Connect to a remote cluster (AKS)"}, utils.Choice)
		switch input {
		case 0:
			if !installKind() {
				return false
			}
			return createKindCluster()
		case 1:
		default:
			fmt.Printf("\n%s  Can't connect to a Kubernetes cluster. Please configure your kubectl context to a valid Kubernetes cluster./%s\n\n", utils.ColorRed(), utils.ColorReset())
			return false
		}
	} else {
		return setupK8sConnection()
	}
	return true
}
func setupK8sConnection() bool {
	return true
}
func createKindCluster() bool {
	err, _ := utils.RunCommand("Creating Kubernetes cluster", "done", false, "kind", "create", "cluster", "--name", "p4e-kind")
	if err != nil {
		fmt.Printf("\n%s  Failed to create Kubernetes cluster./%s\n\n", utils.ColorRed(), utils.ColorReset())
		return false
	}
	return true
}
func installKind() bool {
	os := runtime.GOOS
	switch os {
	case "windows":
		err, _ := utils.RunCommand("Downloading Kind", "done", false, "curl", "-Lo", "kind-windows-amd64.exe", "https://kind.sigs.k8s.io/dl/v0.14.0/kind-windows-amd64")
		if err != nil {
			fmt.Printf("\n%s  Failed to download Kind./%s\n\n", utils.ColorRed(), utils.ColorReset())
			return false
		}
		err, _ = utils.RunCommand("Moving Kind", "done", false, "mv", "kind-windows-amd64.exe", "kind.exe")
		if err != nil {
			fmt.Printf("\n%s  Failed to move Kind./%s\n\n", utils.ColorRed(), utils.ColorReset())
			return false
		}
	case "darwin":
		err, _ := utils.RunCommand("Downloading Kind", "done", false, "curl", "-Lo", "./kind", "https://kind.sigs.k8s.io/dl/v0.14.0/kind-darwin-amd64")
		if err != nil {
			fmt.Printf("\n%s  Failed to download Kind./%s\n\n", utils.ColorRed(), utils.ColorReset())
			return false
		}
		err, _ = utils.RunCommand("Updating Kind access", "done", false, "chmod", "+x", "./kind")
		if err != nil {
			fmt.Printf("\n%s  Failed to update Kind access./%s\n\n", utils.ColorRed(), utils.ColorReset())
			return false
		}
		err, _ = utils.RunCommand("Moving Kind", "done", false, "sudo", "mv", "./kind", "/usr/local/bin/kind")
		if err != nil {
			fmt.Printf("\n%s  Failed to move Kind./%s\n\n", utils.ColorRed(), utils.ColorReset())
			return false
		}
	case "linux":
		err, _ := utils.RunCommand("Downloading Kind", "done", false, "curl", "-Lo", "./kind", "https://kind.sigs.k8s.io/dl/v0.14.0/kind-linux-amd64")
		if err != nil {
			fmt.Printf("\n%s  Failed to download Kind./%s\n\n", utils.ColorRed(), utils.ColorReset())
			return false
		}
		err, _ = utils.RunCommand("Updating Kind access", "done", false, "chmod", "+x", "./kind")
		if err != nil {
			fmt.Printf("\n%s  Failed to update Kind access./%s\n\n", utils.ColorRed(), utils.ColorReset())
			return false
		}
		err, _ = utils.RunCommand("Moving Kind", "done", false, "sudo", "mv", "./kind", "/usr/local/bin/kind")
		if err != nil {
			fmt.Printf("\n%s  Failed to move Kind./%s\n\n", utils.ColorRed(), utils.ColorReset())
			return false
		}
	default:
		fmt.Printf("\n%s  Doesn't know how to install kubectl on %s%s\n\n", utils.ColorRed(), os, utils.ColorReset())
		return false
	}
	return true
}
func installKubectl() bool {
	os := runtime.GOOS
	switch os {
	case "windows":
		err, _ := utils.RunCommand("Downloading kubectl", "done", false, "curl", "-LO", "https://dl.k8s.io/release/v1.24.0/bin/windows/amd64/kubectl.exe")
		if err != nil {
			fmt.Printf("\n%s  Failed to download kubectl./%s\n\n", utils.ColorRed(), utils.ColorReset())
			return false
		}
	case "darwin":
		err, _ := utils.RunCommand("Downloading kubectl", "done", false, "curl", "-LO", "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/darwin/amd64/kubectl")
		if err != nil {
			fmt.Printf("\n%s  Failed to download kubectl./%s\n\n", utils.ColorRed(), utils.ColorReset())
			return false
		}
		err, _ = utils.RunCommand("Updating kubectl access", "done", false, "chmod", "+x", "./kubectl")
		if err != nil {
			fmt.Printf("\n%s  Failed to update kubectl access./%s\n\n", utils.ColorRed(), utils.ColorReset())
			return false
		}
		err, _ = utils.RunCommand("Moving kubectl", "done", false, "sudo", "mv", "./kubectl", "/usr/local/bin/kubectl")
		if err != nil {
			fmt.Printf("\n%s  Failed to move kubectl./%s\n\n", utils.ColorRed(), utils.ColorReset())
			return false
		}
		err, _ = utils.RunCommand("Updating kubectl access", "done", false, "sudo", "chown", "root:", "/usr/local/bin/kubectl")
		if err != nil {
			fmt.Printf("\n%s  Failed to update kubectl access./%s\n\n", utils.ColorRed(), utils.ColorReset())
			return false
		}
	case "linux":
		err, _ := utils.RunCommand("Downloading kubectl", "done", false, "curl", "-LO", "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl")
		if err != nil {
			fmt.Printf("\n%s  Failed to download kubectl./%s\n\n", utils.ColorRed(), utils.ColorReset())
			return false
		}
		err, _ = utils.RunCommand("Installing kubectl", "done", false, "sudo", "install", "-o", "root", "-g", "root", "-m", "0755", "kubectl", "/usr/local/bin/kubectl")
		if err != nil {
			fmt.Printf("\n%s  Failed to install kubectl./%s\n\n", utils.ColorRed(), utils.ColorReset())
			return false
		}
	default:
		fmt.Printf("\n%s  Doesn't know how to install kubectl on %s%s\n\n", utils.ColorRed(), os, utils.ColorReset())
		return false
	}
	return true
}
