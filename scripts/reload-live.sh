#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_SCRIPT="$ROOT_DIR/server.js"

has_reloadable_changes() {
    local changed_file

    while IFS= read -r changed_file; do
        [ -n "$changed_file" ] || continue

        case "$changed_file" in
            public/*|desploy/*|README.md|AGENTS.md|.gitignore|.githooks/*)
                ;;
            *)
                return 0
                ;;
        esac
    done

    return 1
}

find_live_pid() {
    ps -o pid= -o args= -u "$(id -u)" \
        | awk -v target="$TARGET_SCRIPT" 'index($0, target) { print $1; exit }'
}

main() {
    local changed_files
    local force_reload="${1:-}"
    changed_files="$(git -C "$ROOT_DIR" diff-tree --no-commit-id --name-only -r HEAD 2>/dev/null || true)"

    if [ "$force_reload" != "--force" ] && [ -z "$changed_files" ]; then
        exit 0
    fi

    if [ "$force_reload" != "--force" ] && ! has_reloadable_changes <<< "$changed_files"; then
        echo "lindo-tours: no reload needed for this commit."
        exit 0
    fi

    local live_pid
    live_pid="$(find_live_pid)"

    if [ -z "$live_pid" ]; then
        echo "lindo-tours: no live server process found."
        exit 0
    fi

    kill -USR2 "$live_pid"
    echo "lindo-tours: reload signal sent to PID $live_pid."
}

main "$@"
