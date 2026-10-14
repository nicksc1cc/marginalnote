---
title: The Ethics of Delegating Judgment
description: The quiet transfer of decisions to systems that cannot be held responsible, and what it does to the idea of accountability.
date: 2026-09-30
category: Ethics
number: 3
words: 1000
---

There is a category of decision that is easy to automate and wrong to automate, and we are automating it anyway because it is easy.

Consider the credit-scoring algorithm, the hiring filter, the content moderation queue, the insurance premium. Each of these used to be a human judgment, slow, expensive, inconsistent, but a judgment — made by someone who could be questioned, who had a name, who could in principle change their mind. The automated version is fast, consistent, and cheap. It is also, in an important sense, nobody's decision.

## The problem is not bias

Bias gets a lot of attention, and it is a real problem: models trained on historical data reproduce historical inequalities. But bias is the *early* problem. It is the problem you discover in the first audit. The more interesting problem is what the system does to accountability itself.

When a human makes a decision, there is a person at the end of the chain who can be asked: why did you deny this claim? Why did you flag this post? Why is my premium higher than my neighbor's? The answer may be bad — humans give bad answers all the time — but the question is at least possible, and the possibility of being questioned is what makes judgment accountable.

A model's decision has no such chain. There is an output, arrived at by a mechanism so complex that its own creators cannot always reproduce why. When you question it, no one can answer in the first person. There is a vendor, there is a dataset, there is a training run, there is a confidence score. There is no one who decided, in the moral sense of the word.

## Following a rule is not deciding

It is possible to object that humans also follow rules. A clerk denies a claim because the manual says so; an underwriter applies a formula. True enough. But even the most formula-bound human retains a residue of agency: they can notice that the rule produces an absurd result, and escalate, because they are in the world where the result lands. A model is not in the world. It does not feel the absurdity. It has no last-resort self-loathing when it turns out wrong, and more importantly, it has no institutional incentive to care that it is wrong, because institutions do not have to face a wrong model in a disciplinary hearing.

This is the quiet transfer: from *people who can be wrong and answer for it*, to *systems that are wrong and cannot*. The accountability does not vanish — it dissolves into a diffuse responsibility owned by nobody in particular. When the vendor is blamed, they blame the data. When the data is raised, there is no one left in the chain but the decision subject, who is asked to accept a decision produced by nobody.

> "The accountability does not vanish — it dissolves."

## What would responsibility look like

The technical fixes — audits, explainability tools, human-in-the-loop review — are all attempts to re-insert a person into the chain. They help, but only if the person has real authority. A human who reviews one in a thousand decisions, with time pressure and no information beyond what the model displays, is a rubber stamp with health insurance. The loop is only meaningful if the human can surprise the system, which is exactly what makes the system less cheap.

That is the choice hiding under the rhetoric of "AI ethics": how much are we willing to pay to keep someone accountable? The cheap answer is audit trails and dashboard alerts. The honest answer is that accountability requires the possibility of being surprised, and surprise is expensive.

## A note on what is being lost

It is fashionable to say that humans are biased and inconsistent and therefore the machine is an improvement. Bias and inconsistency are real. But they are the price of accountability. The inconsistent human can be argued with. The biased human can be fired. The model that encodes the bias of its data cannot be argued with, only replaced, and the replacement will contain a different bias, invisibly.

We are not choosing between bias and no bias. We are choosing between bias that can be questioned and bias that cannot. That is the actual trade — and it is worth naming it honestly before we optimize our way into it.