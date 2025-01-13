export function formatRustCode(code: string): string {
    const lines = code.split('\n');
    let indentLevel = 0;
    const formattedLines: string[] = [];
    const indent = '    ';

    lines.forEach(line => {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith('}')) {
            indentLevel = Math.max(indentLevel - 1, 0);
        }

        let formattedLine = indent.repeat(indentLevel) + trimmedLine;

        if (trimmedLine.endsWith('{') || trimmedLine.endsWith('(')) {
            indentLevel++;
        }

        if (trimmedLine.endsWith('}')) {
            indentLevel = Math.max(indentLevel - 1, 0);
        }

        formattedLines.push(formattedLine);
    });

    return formattedLines.join('\n');
}