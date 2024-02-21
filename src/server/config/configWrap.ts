import exportConfig, { ConfigObject } from 'export-config';

export default function typedExportConfig<T>(config: ConfigObject): T {
  return exportConfig(config) as T;
}
