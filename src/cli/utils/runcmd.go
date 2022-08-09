package utils

import (
	"bufio"
	"fmt"
	"os/exec"
	"strconv"
	"strings"
	"time"
)

const (
	YesNo  int = 0
	Choice int = 1
)

func GetInput(message string, choices []string, questionType int) int64 {
	for {
		fmt.Printf("  %s ", message)
		if questionType == Choice {
			fmt.Println()
			for i, c := range choices {
				fmt.Printf("\n    %s%d)%s %s", ColorCyan(), i, ColorReset(), c)
			}
			fmt.Printf("\n\n  Your choice (0 - %d): ", len(choices)-1)
		}
		var input string
		fmt.Scanln(&input)
		switch questionType {
		case YesNo:
			str := strings.ToLower(strings.TrimSpace(input))
			if str == "y" || str == "yes" {
				return 1
			}
			return 0
		case Choice:
			index, err := strconv.ParseInt(strings.TrimSpace(input), 10, 64)
			if err == nil {
				if index <= int64(len(choices)-1) {
					return index
				}
			}
		}
	}
}

func RunCommand(message string, successMessage string, showOutput bool, name string, args ...string) (error, string) {
	cmd := exec.Command(name, args...)
	output := []string{}
	errOutput := []string{}
	cmdReader, _ := cmd.StdoutPipe()
	outScanner := bufio.NewScanner(cmdReader)
	errReader, _ := cmd.StderrPipe()
	errScanner := bufio.NewScanner(errReader)
	done := make(chan bool)
	running := false
	var exeErr error
	hideCursor()
	go func() {
		cmd.Start()
		running = true
		exeErr = cmd.Wait()
		running = false
		done <- true
	}()
	go func() {
		for errScanner.Scan() {
			errOutput = append(errOutput, errScanner.Text())
		}
		<-done
	}()
	go func() {
		for outScanner.Scan() {
			output = append(output, outScanner.Text())
		}
		<-done
	}()
	go func() {
		for {
			for _, r := range `⣾⣽⣻⢿⡿⣟⣯⣷` {
				if running {
					fmt.Printf("\r  %s%s%s %c%s", ColorReset(), message, ColorYellow(), r, ColorReset())
					time.Sleep(100 * time.Millisecond)
				}
			}
		}
	}()
	<-done
	running = false
	time.Sleep(200 * time.Millisecond)
	if exeErr == nil {
		fmt.Printf("\r  %s%s%s ...%s%s \n", ColorReset(), message, ColorGreen(), successMessage, ColorReset())
	} else {
		fmt.Printf("\r  %s%s%s ...%s%s \n", ColorReset(), message, ColorYellow(), "failed", ColorReset())
	}

	if showOutput {
		for _, o := range output {
			fmt.Printf("    %s\n", o)
		}
		for _, o := range errOutput {
			fmt.Printf("    %s%s\n%s", ColorRed(), o, ColorReset())
		}
	}
	showCursor()
	return exeErr, strings.Join(output, " ")
}

var Esc = "\x1b"

func escape(format string, args ...interface{}) string {
	return fmt.Sprintf("%s%s", Esc, fmt.Sprintf(format, args...))
}

func showCursor() {
	fmt.Print(escape("[?25h"))
}

// Hide returns ANSI escape sequence to hide the cursor
func hideCursor() {
	fmt.Print(escape("[?25l"))
}
func ColorCyan() string {
	return escape("[36m")
}
func ColorReset() string {
	return escape("[0m")
}
func ColorGreen() string {
	return escape("[32m")
}
func ColorRed() string {
	return escape("[31m")
}
func ColorYellow() string {
	return escape("[33m")
}
func ColorBlue() string {
	return escape("[34m")
}
func ColorPurple() string {
	return escape("[35m")
}
func ColorWhite() string {
	return escape("[37m")
}
