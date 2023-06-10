# Intro
Decentralizing a website is easy with IPFS, the hard part is to make it dynamic without having to rely on DNS providers. **Unstoppable Blog Tool** empowers creators to deploy decentralized but dynamic blogs to IPFS. 

By leveraging the power of smart contracts on the Venom blockchain, we enable them to upload dynamically, revolutionizing the way creators publish and monetize quality content.

# Architecture
## main
- A react front-end is hosted in IPFS network like any other static decentralized website.
- The react app reads blog post CIDs from the smart contract
- External users can suggest posts
- The Blog Owner (contract owner) can add their own posts or chose to accept/reject a suggested post
![architecture.png](https://cdn.dorahacks.io/static/files/188a4b91109303fc1f88ece42e1918b2.png)

## Pay to post
- When deploying the contract, the blog owner can chose the minimum payment to accept a post
- Alongside with a tip, a smaller value that gets payed if post is rejected, for the job of reading/selecting the post
- External users can suggest posts and the value they want to pay to display that post
- Blog owners can accept the post (thus receiving the payment)
- Or reject the post, receiving only the tip and giving back the payment value
