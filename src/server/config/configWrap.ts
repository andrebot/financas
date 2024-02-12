import exportConfig from 'export-config';

interface ConfigObj {
  default: any;
  development?: any;
  production?: any;
}

export default function typedExportConfig<T>(config: ConfigObj): T {
  return exportConfig(config as any) as T;
}
