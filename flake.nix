{
  description = "Relievo browser depth relief renderer";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      systems = [ "aarch64-darwin" "x86_64-darwin" "x86_64-linux" ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
    in
    {
      devShells = forAllSystems (system:
        let
          pkgs = import nixpkgs { inherit system; };
        in
        {
          default = pkgs.mkShell {
            packages = [
              pkgs.nodejs_24
            ];

            shellHook = ''
              export npm_config_prefix="$PWD/.npm-global"
              export PATH="$PWD/node_modules/.bin:$PATH"
            '';
          };
        });
    };
}
