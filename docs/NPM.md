# NPM Publishing

To trigger the build and publish to NPM:

1. Create and push a git tag:
   ```bash
   export VERSION=0.1.0 # or 1.2.3-beta, etc.
   git tag v$VERSION
   git push origin v$VERSION
   ```

2. Create a GitHub release from the tag to trigger the publish workflow.
