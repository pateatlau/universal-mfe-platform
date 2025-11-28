/**
 * Module Federation type declarations
 * 
 * The remote exports HomeScreen as a named export: export { default as HomeScreen }
 * So we need to declare both the named export and default export
 */
declare module 'feature_home_remote/HomeScreen' {
  import { ComponentType } from 'react';
  export const HomeScreen: ComponentType;
  export default HomeScreen;
}
