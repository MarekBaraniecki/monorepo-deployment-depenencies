# Monorepo deployment dependencies
This is a repository containing a github action and interconnected github workflows, that aim to efficiently 
deploy several packages in a monorepo environment, taking account predefined deployment dependencies.
For further documentation please see the create-matrix action README file.

## Reusable workflows limit
This setup is limited by the max reusable workflow calls in gha, which is 20. 
Create-matrix is always called and then each deployment step consists of two additional workflow calls.
This means that given a eployment that is split into 3 steps, minimum of 7 workflows are called. This leave maximum of 13 packages can be deployed at one time. With two steps this increases to 15 etc

This limitation can be optimized, should some packages have the same deployment workflow (ie multiple JS packages deployed to k8s) by adjusting the create-matrix script to further group packages by deployment workflow type 
