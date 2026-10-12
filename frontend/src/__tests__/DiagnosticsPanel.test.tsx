import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DiagnosticsPanel } from '../components/editor/DiagnosticsPanel';
import { Diagnostic } from '../types';

describe('DiagnosticsPanel Component', () => {
  it('displays "No issues detected by available checks" when diagnostics are empty', () => {
    render(
      <DiagnosticsPanel
        diagnostics={[]}
        onExplainDiagnostic={vi.fn()}
        selectedDiagnostic={null}
        onSelectDiagnostic={vi.fn()}
      />
    );

    expect(screen.getByText('No issues detected by available checks')).toBeDefined();
  });

  it('renders error diagnostics with line numbers and messages', () => {
    const mockDiagnostics: Diagnostic[] = [
      {
        severity: 'error',
        line: 4,
        column: 12,
        error_code: 'MISSING_COLON',
        message: 'Python Syntax Error: expected \':\'',
        source: 'python-ast',
        suggested_fix: 'Add a colon at the end of the line.'
      }
    ];

    render(
      <DiagnosticsPanel
        diagnostics={mockDiagnostics}
        onExplainDiagnostic={vi.fn()}
        selectedDiagnostic={null}
        onSelectDiagnostic={vi.fn()}
      />
    );

    expect(screen.getByText('Line 4:12')).toBeDefined();
    expect(screen.getByText('MISSING_COLON')).toBeDefined();
    expect(screen.getByText('Python Syntax Error: expected \':\'')).toBeDefined();
    expect(screen.getByText('Explain with AI')).toBeDefined();
  });

  it('renders Blueprint button when diagnostic has blueprint', () => {
    const onViewBlueprint = vi.fn();
    const mockDiagnostics: Diagnostic[] = [
      {
        severity: 'error',
        line: 1,
        column: 5,
        error_code: 'MISSING_COLON',
        message: 'Python Syntax Error: expected \':\'',
        source: 'python-ast',
        blueprint: {
          title: 'Python Compound Def Header Blueprint',
          grammar_rule: 'funcdef ::= def name (...) :',
          parser_stage: 'Syntactic Parser',
          impact: 'Parser cannot transition to suite',
          canonical_spec: 'def func(): pass',
          anatomy: []
        }
      }
    ];

    render(
      <DiagnosticsPanel
        diagnostics={mockDiagnostics}
        onExplainDiagnostic={vi.fn()}
        selectedDiagnostic={null}
        onSelectDiagnostic={vi.fn()}
        onViewBlueprint={onViewBlueprint}
      />
    );

    expect(screen.getByText('Blueprint')).toBeDefined();
  });
});
